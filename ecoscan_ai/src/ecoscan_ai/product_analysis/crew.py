from crewai import Task, Agent, Crew, Process
from crewai.project import agent, task, crew, CrewBase

from ecoscan_ai.product_analysis.models import (
    ProductAnalysisResult,
    ProductAnalysisRequest,
)


@CrewBase
class ProductAnalysisCrew:
    @agent
    def product_analyzer(self) -> Agent:
        return Agent(config=self.agents_config["product_analyzer"], verbose=True)  # type: ignore[index]

    @task
    def analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config["analysis_task"],
            output_pydantic=ProductAnalysisResult,
        )  # type: ignore[index]

    @crew
    def crew(self) -> Crew:
        """Creates the ProductAnalysis crew"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )

    def run(self, request: ProductAnalysisRequest) -> ProductAnalysisResult:
        result = self.crew().kickoff(
            inputs={
                "productName": request.productName,
                "productDescription": request.productDescription,
                "productId": request.productId,
            }
        )
        pydantic_output: ProductAnalysisResult = result.pydantic  # type: ignore[assignment]
        return pydantic_output
