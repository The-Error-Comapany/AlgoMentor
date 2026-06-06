import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEndpoint
from langchain_core.prompts import PromptTemplate

# Load environment variables
load_dotenv()

app = FastAPI(title="AlgoMentor AI Service")

# Allow CORS so Next.js can communicate with it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuickCardRequest(BaseModel):
    title: str
    difficulty: str
    tags: List[str]
    patternUsed: str
    personalNotes: str

class SolutionCardRequest(BaseModel):
    title: str
    difficulty: str
    tags: List[str]
    programmingLanguage: str
    solutionCode: str

# No more fallback heuristics. We want to guarantee real AI output or fail loudly.

def get_llm():
    token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if not token or "placeholder" in token or "random" in token:
        return None
    repo_id = "meta-llama/Meta-Llama-3-8B-Instruct"
    return HuggingFaceEndpoint(
        repo_id=repo_id,
        huggingfacehub_api_token=token,
        temperature=0.1, # Extremely low temp for high focus and accuracy
        max_new_tokens=800,
        return_full_text=False
    )

QUICK_TEMPLATE = """You are a Senior Technical Interview Coach. Create a structured interview revision card strictly for the requested DSA problem.
CRITICAL: Generate the summary EXACTLY for the provided problem. Do NOT hallucinate concepts from other topics or problems.

Problem Title: {title}
Difficulty: {difficulty}
Tags: {tags}
Algorithm Pattern Used: {patternUsed}
User's Personal Notes: {personalNotes}

Leverage your internal algorithmic knowledge about '{patternUsed}' and combine it seamlessly with the user's personal notes to generate a highly accurate, targeted summary for this specific problem.

Respond with a strictly formatted JSON object. Do not include any markdown backticks, markdown styling, or text outside the JSON object.
The JSON object must have exactly these keys:
{{
  "pattern": "Identify the standard algorithmic pattern (e.g. Sliding Window, DFS, etc.)",
  "coreIdea": "A 1-2 sentence description of the core logic/algorithm used to solve it.",
  "stateDefinition": "If DP, define the dp array/state; if other, define the key tracking structures/variables.",
  "transitionLogic": "Explain the step-by-step transition formula or loop lookup mechanism.",
  "timeComplexity": "Big-O runtime analysis.",
  "spaceComplexity": "Big-O space/memory analysis.",
  "commonMistakes": "1-2 common bugs, edge cases, or sub-optimal traps specifically for this problem.",
  "interviewInsights": "A tip or secret for coding interviews regarding this specific problem.",
  "relatedProblems": ["List 2-3 similar or extension problems"]
}}
JSON:"""

SOLUTION_TEMPLATE = """You are a Senior Technical Interview Coach. Deeply analyze the provided solution code and create a structured interview revision card strictly for this DSA problem.
CRITICAL: Generate the summary EXACTLY for the provided problem and code. Do NOT hallucinate concepts from other topics or problems.

Problem Title: {title}
Difficulty: {difficulty}
Tags: {tags}
Programming Language: {programmingLanguage}

Solution Code:
{solutionCode}

Analyze the provided code carefully to extract the true time/space complexity, core approach, and edge case handling logic. Generate a highly accurate, targeted summary for this specific problem based purely on the code logic.

Respond with a strictly formatted JSON object. Do not include any markdown backticks, markdown styling, or text outside the JSON object.
The JSON object must have exactly these keys:
{{
  "pattern": "Identify the standard algorithmic pattern used in the code.",
  "coreIdea": "A 1-2 sentence description of the core logic/algorithm implemented in the code.",
  "stateDefinition": "If DP, define the dp array/state; if other, define the key tracking structures/variables seen in the code.",
  "transitionLogic": "Explain the step-by-step transition formula or loop lookup mechanism used in the code.",
  "timeComplexity": "Big-O runtime analysis based on the code loops.",
  "spaceComplexity": "Big-O space/memory analysis based on the code structures.",
  "commonMistakes": "1-2 common bugs, edge cases, or sub-optimal traps specifically for this problem.",
  "interviewInsights": "A tip or secret for coding interviews regarding this specific problem.",
  "relatedProblems": ["List 2-3 similar or extension problems"]
}}
JSON:"""

import re

def parse_json_response(response_text: str) -> dict:
    text = response_text.strip()
    # Use regex to find a JSON object in case there is conversational wrapper text
    json_match = re.search(r'\{[\s\S]*\}', text)
    if not json_match:
        raise ValueError(f"No JSON object found in response: {text}")
    
    json_str = json_match.group(0)
    return json.loads(json_str)

@app.post("/generate-quick-card")
async def generate_quick_card(request: QuickCardRequest):
    llm = get_llm()
    if not llm:
        raise HTTPException(status_code=500, detail="HuggingFace token is missing or invalid.")

    try:
        prompt = PromptTemplate.from_template(QUICK_TEMPLATE)
        chain = prompt | llm
        
        tags_str = ", ".join(request.tags)
        response_text = chain.invoke({
            "title": request.title,
            "difficulty": request.difficulty,
            "tags": tags_str,
            "patternUsed": request.patternUsed,
            "personalNotes": request.personalNotes
        })
        return parse_json_response(response_text)
    except Exception as e:
        print(f"Failed to generate quick AI card. Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Generation Failed: {str(e)}")

@app.post("/generate-solution-card")
async def generate_solution_card(request: SolutionCardRequest):
    llm = get_llm()
    if not llm:
        raise HTTPException(status_code=500, detail="HuggingFace token is missing or invalid.")

    try:
        prompt = PromptTemplate.from_template(SOLUTION_TEMPLATE)
        chain = prompt | llm
        
        tags_str = ", ".join(request.tags)
        response_text = chain.invoke({
            "title": request.title,
            "difficulty": request.difficulty,
            "tags": tags_str,
            "programmingLanguage": request.programmingLanguage,
            "solutionCode": request.solutionCode
        })
        return parse_json_response(response_text)
    except Exception as e:
        print(f"Failed to generate solution AI card. Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Generation Failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
