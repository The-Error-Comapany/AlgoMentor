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

# Allow CORS so Next.js can communicate with it.
# Set ALLOWED_ORIGINS in .env as a comma-separated list of origins.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
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

import requests

def call_groq_completion(prompt_text: str) -> str:
    token = os.getenv("GROQ_API_KEY")
    if not token or "placeholder" in token or "random" in token:
        raise ValueError("GROQ_API_KEY is missing or invalid. Please add it to your .env file from console.groq.com.")
    
    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [{"role": "user", "content": prompt_text}],
        "temperature": 0.1,
        "max_tokens": 1024
    }
    response = requests.post(API_URL, headers=headers, json=payload)
    if response.status_code != 200:
        raise Exception(f"Groq API Error {response.status_code}: {response.text}")
    
    result = response.json()
    if "choices" in result and len(result["choices"]) > 0:
        return result["choices"][0]["message"]["content"]
    return str(result)

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
    import json
    return json.loads(json_str)

@app.post("/generate-quick-card")
async def generate_quick_card(request: QuickCardRequest):
    try:
        tags_str = ", ".join(request.tags)
        prompt_text = QUICK_TEMPLATE.format(
            title=request.title,
            difficulty=request.difficulty,
            tags=tags_str,
            patternUsed=request.patternUsed,
            personalNotes=request.personalNotes
        )
        response_text = call_groq_completion(prompt_text)
        return parse_json_response(response_text)
    except Exception as e:
        print(f"Failed to generate quick AI card. Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Generation Failed: {str(e)}")

@app.post("/generate-solution-card")
async def generate_solution_card(request: SolutionCardRequest):
    try:
        tags_str = ", ".join(request.tags)
        prompt_text = SOLUTION_TEMPLATE.format(
            title=request.title,
            difficulty=request.difficulty,
            tags=tags_str,
            programmingLanguage=request.programmingLanguage,
            solutionCode=request.solutionCode
        )
        response_text = call_groq_completion(prompt_text)
        return parse_json_response(response_text)
    except Exception as e:
        print(f"Failed to generate solution AI card. Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Generation Failed: {str(e)}")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None
    userContext: Optional[str] = None

def call_groq_chat(message: str, history: Optional[List[ChatMessage]] = None, user_context: Optional[str] = None) -> str:
    token = os.getenv("GROQ_API_KEY")
    if not token or "placeholder" in token or "random" in token:
        raise ValueError("GROQ_API_KEY is missing or invalid. Please add it to your .env file from console.groq.com.")
    
    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {token}"}
    
    system_prompt = (
        "You are AlgoMentor AI, an expert Senior Technical Interview Coach and DSA mentor. "
        "A student is asking for your help. Give a concise, helpful, and encouraging response focusing on Data Structures and Algorithms. "
        "Do not just give the code answer directly; try to guide them using the Socratic method.\n"
        "Explain time complexities and space complexities in detail. Formulate a future plan or suggestions if applicable.\n"
        "CRITICAL INSTRUCTION: When you suggest a specific DSA problem for the user to solve, you MUST wrap the problem title exactly like this: [PROBLEM: Title]. "
        "For example, 'You should try [PROBLEM: Climbing Stairs] next.' This allows the frontend to render an interactive button.\n"
        "CRITICAL INSTRUCTION: DO NOT ask the user for their experience level, preferred platforms, or topics they want to improve on. "
        "You already have access to this via the 'User Profile Context' below. If their profile context is completely empty (0 solved), immediately assume they are a beginner and proactively suggest a starting path (like Arrays/Hashing) instead of asking them.\n\n"
    )
    
    if user_context and user_context.strip():
        system_prompt += (
            "Here is the student's current profile context fetched from the database. Use this context to personalize your advice. "
            "Explicitly reference their past struggles, their solved problems, and suggest what they should focus on next based on their revision schedule and mastery scores:\n"
            f"{user_context}\n"
        )
    
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    if history and len(history) > 0:
        # history includes the current message from the frontend
        for h in history:
            messages.append({"role": h.role, "content": h.content})
    else:
        messages.append({"role": "user", "content": message})
        
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 1024
    }
    
    response = requests.post(API_URL, headers=headers, json=payload)
    if response.status_code != 200:
        raise Exception(f"Groq API Error {response.status_code}: {response.text}")
    
    result = response.json()
    if "choices" in result and len(result["choices"]) > 0:
        return result["choices"][0]["message"]["content"]
    return str(result)

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        response_text = call_groq_chat(request.message, request.history, request.userContext)
        return {"reply": response_text.strip()}
    except Exception as e:
        print(f"Failed to generate chat response. Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Chat Failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
