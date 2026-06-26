from pathlib import Path

from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

from ecoscan_ai.savings.models import SavingsResult, SavingsRequest


@CrewBase
class SavingsCrew:
    agents_config = str(Path(__file__).parent / "config" / "agents.yaml")
    tasks_config = str(Path(__file__).parent / "config" / "tasks.yaml")

    @agent
    def co2_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config["co2_analyst"],  # type: ignore[index]
            verbose=True,
            max_iter=5,
            allow_delegation=False,
        )

    @agent
    def formatter(self) -> Agent:
        return Agent(
            config=self.agents_config["formatter"],  # type: ignore[index]
            verbose=True,
            max_iter=3,
            allow_delegation=False,
        )

    @task
    def co2_task(self) -> Task:
        return Task(config=self.tasks_config["co2_task"])  # type: ignore[index]

    @task
    def format_task(self) -> Task:
        return Task(
            config=self.tasks_config["format_task"],
            output_pydantic=SavingsResult,
        )  # type: ignore[index]

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,  # type: ignore[attr-defined]
            tasks=self.tasks,  # type: ignore[attr-defined]
            process=Process.sequential,
            verbose=True,
        )

    def run(self, request: SavingsRequest) -> SavingsResult:
        result = self.crew().kickoff(inputs={"savingsContext": request.savingsContext})
        pydantic_output: SavingsResult = result.pydantic  # type: ignore[assignment]
        return pydantic_output
