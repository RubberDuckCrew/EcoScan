from crewai import Task, Agent, Crew, Process
from crewai.project import agent, task, crew, CrewBase

from ecoscan_ai.api.schemas.savings_result import SavingsResult


@CrewBase
class SavingsCrew:
    @agent
    def evaluator(self) -> Agent:
        return Agent(config=self.agents_config["evaluator"], verbose=True)

    @agent
    def score_agent(self) -> Agent:
        return Agent(config=self.agents_config["score_agent"], verbose=True)

    @agent
    def reasoning_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["reasoning_agent"], reasoning=True, verbose=True
        )

    @task
    def evaluate_task(self) -> Task:
        return Task(config=self.tasks_config["evaluate_task"])

    @task
    def score_task(self) -> Task:
        return Task(config=self.tasks_config["score_task"])

    @task
    def reasoning_task(self) -> Task:
        return Task(
            config=self.tasks_config["reasoning_task"], output_pydantic=SavingsResult
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Savings crew"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )
