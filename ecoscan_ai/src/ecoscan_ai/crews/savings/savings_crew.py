from crewai import Task, Agent, Crew, Process
from crewai.project import agent, task, crew, CrewBase

from ecoscan_ai.api.schemas.savings_result import SavingsResult


@CrewBase
class SavingsCrew:
    @agent
    def evaluator(self) -> Agent:
        return Agent(config=self.agents_config["evaluator"], verbose=True)  # type: ignore[index]

    @agent
    def score_agent(self) -> Agent:
        return Agent(config=self.agents_config["score_agent"], verbose=True)  # type: ignore[index]

    @agent
    def reasoning_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["reasoning_agent"], reasoning=True, verbose=True
        )  # type: ignore[index]

    @task
    def evaluate_task(self) -> Task:
        return Task(config=self.tasks_config["evaluate_task"])  # type: ignore[index]

    @task
    def score_task(self) -> Task:
        return Task(
            config=self.tasks_config["score_task"],  # type: ignore[index]
        )

    @task
    def reasoning_task(self) -> Task:
        return Task(
            config=self.tasks_config["reasoning_task"],
            output_pydantic=SavingsResult,  # type: ignore[index]
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Savings crew"""
        # To learn how to add knowledge sources to your crew, check out the documentation:
        # https://docs.crewai.com/concepts/knowledge#what-is-knowledge

        return Crew(
            agents=self.agents,  # Automatically created by the @agent decorator
            tasks=self.tasks,  # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
        )
