from pydantic import BaseModel, Field


class AISummaryRequest(BaseModel):
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)


class AISummaryResponse(BaseModel):
    summary: str
    highlights: list[str]
    warnings: list[str]
    recommendations: list[str]
    metadata: dict


class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=2, max_length=500)


class AIChatResponse(BaseModel):
    answer: str
    intent: str
    metadata: dict