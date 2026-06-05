import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

class CardRequest(BaseModel):
    title: str
    difficulty: str
    tags: list[str]

# Define prompt template exactly as requested to output JSON
TEMPLATE = """You are a Senior Technical Interview Coach. Create a structured interview revision card for the DSA problem.
Problem Title: {title}
Difficulty: {difficulty}
Tags: {tags}

Respond with a strictly formatted JSON object. Do not include any markdown backticks, markdown styling, or text outside the JSON object.
The JSON object must have exactly these keys:
{{
  "pattern": "Identify the standard algorithmic pattern (e.g. Sliding Window, DFS, Two Pointers, Unbounded Knapsack, etc.)",
  "coreIdea": "A 1-2 sentence description of the core logic/algorithm used to solve it.",
  "stateDefinition": "If DP, define the dp array/state; if other, define the key tracking structures/variables.",
  "transitionLogic": "Explain the step-by-step transition formula or loop lookup mechanism.",
  "timeComplexity": "Big-O runtime analysis.",
  "spaceComplexity": "Big-O space/memory analysis.",
  "commonMistakes": "1-2 common bugs, edge cases, or sub-optimal traps for this problem.",
  "interviewInsights": "A tip or secret for coding interviews regarding this specific problem.",
  "relatedProblems": ["List 2-3 similar or extension problems"]
}}
JSON:"""

# Fallback heuristic card
def generate_heuristic_card(title: str, difficulty: str, tags: list[str]) -> dict:
    primary_tag = tags[0] if tags else "General"
    return {
        "pattern": f"{primary_tag.upper()} / Dynamic Analysis",
        "coreIdea": f"Solve the problem '{title}' by leveraging data structures or algorithms suitable for {primary_tag}.",
        "stateDefinition": f"For {primary_tag} problems, define a search space, state parameters, or optimal sub-structures.",
        "transitionLogic": "Construct the output step-by-step or combine results from sub-states iteratively.",
        "timeComplexity": "O(N)" if difficulty.lower() == "easy" else ("O(N log N) or O(N)" if difficulty.lower() == "medium" else "O(N^2) or O(2^N)"),
        "spaceComplexity": "O(1)" if difficulty.lower() == "easy" else "O(N) auxiliary space",
        "commonMistakes": "1. Missing base case boundary checks.\n2. Incorrect array size index or stack overflow from deep recursion.",
        "interviewInsights": "Be ready to explain the trade-offs between space and time complexity for this solution, and write code cleanly.",
        "relatedProblems": ["Two Sum", "Coin Change", "Climbing Stairs"]
    }

@app.post("/generate-card")
async def generate_card(request: CardRequest):
    token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
    
    if not token or "placeholder" in token or "random" in token:
        print("Using local heuristic generator for card due to placeholder HuggingFace token.")
        return generate_heuristic_card(request.title, request.difficulty, request.tags)

    try:
        # We use a high quality open-source model: meta-llama/Llama-3-8B-Instruct
        repo_id = "meta-llama/Meta-Llama-3-8B-Instruct"
        
        llm = HuggingFaceEndpoint(
            repo_id=repo_id,
            huggingfacehub_api_token=token,
            temperature=0.2,
            max_new_tokens=800,
            return_full_text=False
        )

        prompt = PromptTemplate.from_template(TEMPLATE)
        chain = prompt | llm

        tags_str = ", ".join(request.tags)
        response_text = chain.invoke({
            "title": request.title,
            "difficulty": request.difficulty,
            "tags": tags_str
        })

        # Strip markdown formatting if any was returned
        text = response_text.strip()
        if text.startswith("```"):
            text = text.replace("```json", "").replace("```", "").strip()

        card = json.loads(text)
        return card

    except Exception as e:
        print(f"Failed to generate AI card using HuggingFace. Falling back to heuristics. Error: {e}")
        return generate_heuristic_card(request.title, request.difficulty, request.tags)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
