from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import os
import logging
import asyncio
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure Gemini API
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    logger.error("GOOGLE_API_KEY not found in environment variables")
    raise Exception("GOOGLE_API_KEY not configured")

genai.configure(api_key=api_key)
logger.info("Gemini API configured successfully")

# Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MathProblem(BaseModel):
    problem: str

async def generate_solution_with_timeout(model, prompt: str, timeout: int = 30) -> Optional[str]:
    try:
        # Create a task for the model generation
        response = await asyncio.wait_for(
            asyncio.get_event_loop().run_in_executor(None, lambda: model.generate_content(prompt)),
            timeout=timeout
        )
        return response.text
    except asyncio.TimeoutError:
        logger.error(f"Generation timed out after {timeout} seconds")
        raise HTTPException(status_code=504, detail="Solution generation timed out")
    except Exception as e:
        logger.error(f"Error generating solution: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}

@app.post("/api/py/solve-math")
async def solve_math_problem(math_problem: MathProblem):
    try:
        logger.info(f"Received math problem: {math_problem.problem}")
        
        # Initialize Gemini Pro model
        model = genai.GenerativeModel('gemini-2.0-flash')
        logger.info("Gemini model initialized")
        
        # Create a prompt that instructs Gemini to solve the math problem
        prompt = f"""
        Solve this math problem step by step:
        {math_problem.problem}

        Provide your solution in this structured format:
        1. First, write "STEPS:" followed by each step of solving the equation on a new line
        2. Then, write "FINAL:" followed by the final answer
        3. Finally, write "VERIFY:" followed by the verification steps

        Example for "Solve 2x + 5 = 13":

        STEPS:
        2x + 5 = 13
        2x = 13 - 5
        2x = 8
        x = 8/2
        x = 4

        FINAL:
        x = 4

        VERIFY:
        2(4) + 5 = 13
        8 + 5 = 13
        13 = 13
        """

        # Generate response from Gemini with timeout
        logger.info("Generating solution from Gemini")
        solution = await generate_solution_with_timeout(model, prompt)
        logger.info("Received response from Gemini")
        
        if not solution:
            raise HTTPException(status_code=500, detail="Failed to generate solution")

        solution = solution.strip()
        logger.info(f"Solution generated: {solution[:100]}...")

        # Return the solution
        return {
            "problem": math_problem.problem,
            "solution": solution,
            "status": "success"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error solving math problem: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/py/models")
async def list_models():
    try:
        # List available models
        models = genai.list_models()
        return {
            "available_models": [
                {"name": model.name, "description": model.description}
                for model in models
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))