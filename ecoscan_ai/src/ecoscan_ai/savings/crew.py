from pathlib import Path

from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

from ecoscan_ai.savings.models import SavingsResult, SavingsRequest


@CrewBase
class SavingsCrew:
    agents_config = str(Path(__file__).parent / "config" / "agents.yaml")
    tasks_config = str(Path(__file__).parent / "config" / "tasks.yaml")

    @agent
    def evaluator(self) -> Agent:
        return Agent(config=self.agents_config["evaluator"], verbose=True)  # type: ignore[index]

    @agent
    def score_agent(self) -> Agent:
        return Agent(config=self.agents_config["score_agent"], verbose=True)  # type: ignore[index]

    @agent
    def reasoning_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["reasoning_agent"],
            reasoning=True,
            verbose=True,
        )

    @task
    def evaluate_task(self) -> Task:
        return Task(config=self.tasks_config["evaluate_task"])  # type: ignore[index]

    @task
    def score_task(self) -> Task:
        return Task(config=self.tasks_config["score_task"])  # type: ignore[index]

    @task
    def reasoning_task(self) -> Task:
        return Task(
            config=self.tasks_config["reasoning_task"],
            output_pydantic=SavingsResult,
        )  # type: ignore[index]

    @crew
    def crew(self) -> Crew:
        """Creates the Savings crew"""
        return Crew(
            agents=self.agents,  # type: ignore[attr-defined]
            tasks=self.tasks,  # type: ignore[attr-defined]
            process=Process.sequential,
            verbose=True,
        )

    def run(self, request: SavingsRequest) -> SavingsResult:
        inputs = {
            "savingsContext": request.savingsContext,
        }
        result = self.crew().kickoff(inputs=inputs)
        pydantic_output: SavingsResult = result.pydantic  # type: ignore[assignment]
        return pydantic_output
