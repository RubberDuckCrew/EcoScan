from crewai import LLM

llm = LLM(
    model= "ollama/quen3:8b",
    base_url = "http://localhost:11434",
    temperature = 0.1,
)