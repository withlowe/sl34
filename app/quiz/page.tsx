"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, RotateCcw, ArrowRight } from "lucide-react"
import { getFlashcards, getAllTags } from "@/lib/storage"
import type { Flashcard } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

// Number of options to show in multiple choice
const NUM_OPTIONS = 4

type QuizQuestion = {
  flashcard: Flashcard
  options: string[]
  correctOptionIndex: number
}

type AnswerRecord = {
  flashcardId: string
  question: string
  correctAnswer: string
  userAnswer: string | null
  isCorrect: boolean
}

export default function QuizPage() {
  const router = useRouter()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([])
  const [quizFlashcards, setQuizFlashcards] = useState<Flashcard[]>([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [answerRecords, setAnswerRecords] = useState<AnswerRecord[]>([])
  const [retryMode, setRetryMode] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])

  useEffect(() => {
    const cards = getFlashcards()
    setAllFlashcards(cards)
    setAllTags(getAllTags())
  }, [])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Generate multiple choice questions
  const generateQuizQuestions = (flashcards: Flashcard[]): QuizQuestion[] => {
    if (flashcards.length === 0) return []

    return flashcards.map((card) => {
      // Get potential wrong answers from other flashcards
      const otherAnswers = allFlashcards
        .filter((f) => f.id !== card.id)
        .map((f) => f.back)
        .filter((answer) => answer.trim() !== card.back.trim())

      // Shuffle and take up to NUM_OPTIONS - 1 wrong answers
      const shuffledWrongAnswers = otherAnswers.sort(() => Math.random() - 0.5).slice(0, NUM_OPTIONS - 1)

      // If we don't have enough wrong answers, duplicate some
      while (shuffledWrongAnswers.length < NUM_OPTIONS - 1) {
        shuffledWrongAnswers.push(otherAnswers[Math.floor(Math.random() * otherAnswers.length)] || "No answer")
      }

      // Insert correct answer at random position
      const correctOptionIndex = Math.floor(Math.random() * NUM_OPTIONS)
      const options = [...shuffledWrongAnswers]
      options.splice(correctOptionIndex, 0, card.back)

      return {
        flashcard: card,
        options,
        correctOptionIndex,
      }
    })
  }

  const startQuiz = () => {
    if (selectedTags.length === 0) return

    // Filter and shuffle flashcards
    const filteredCards = allFlashcards.filter((card) => selectedTags.some((tag) => card.tags.includes(tag)))
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5)

    setQuizFlashcards(shuffled)
    const questions = generateQuizQuestions(shuffled)
    setQuizQuestions(questions)
    setQuizStarted(true)
    setCurrentIndex(0)
    setSelectedOption(null)
    setAnswerSubmitted(false)
    setAnswerRecords([])
    setRetryMode(false)
  }

  const handleOptionSelect = (optionIndex: number) => {
    if (answerSubmitted) return
    setSelectedOption(optionIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !quizQuestions.length || currentIndex >= quizQuestions.length) return

    const currentQuestion = quizQuestions[currentIndex]
    const isCorrect = selectedOption === currentQuestion.correctOptionIndex

    // Record the answer
    setAnswerRecords((prev) => [
      ...prev,
      {
        flashcardId: currentQuestion.flashcard.id,
        question: currentQuestion.flashcard.front,
        correctAnswer: currentQuestion.flashcard.back,
        userAnswer: currentQuestion.options[selectedOption],
        isCorrect,
      },
    ])

    setAnswerSubmitted(true)

    // Move to next question after a delay
    setTimeout(() => {
      if (currentIndex < quizQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setSelectedOption(null)
        setAnswerSubmitted(false)
      }
    }, 1500)
  }

  const resetQuiz = () => {
    setQuizStarted(false)
    setSelectedTags([])
    setQuizFlashcards([])
    setCurrentIndex(0)
    setSelectedOption(null)
    setAnswerSubmitted(false)
    setAnswerRecords([])
    setRetryMode(false)
    setQuizQuestions([])
  }

  const startRetryQuiz = () => {
    // Get flashcards that were answered incorrectly
    const incorrectFlashcardIds = answerRecords
      .filter((record) => !record.isCorrect)
      .map((record) => record.flashcardId)

    const incorrectFlashcards = quizFlashcards.filter((card) => incorrectFlashcardIds.includes(card.id))

    if (incorrectFlashcards.length === 0) return

    setQuizFlashcards(incorrectFlashcards)
    const questions = generateQuizQuestions(incorrectFlashcards)
    setQuizQuestions(questions)
    setCurrentIndex(0)
    setSelectedOption(null)
    setAnswerSubmitted(false)
    setAnswerRecords([])
    setRetryMode(true)
  }

  const isQuizComplete = quizStarted && currentIndex >= quizQuestions.length - 1 && answerSubmitted
  const currentQuestion =
    quizQuestions.length > 0 && currentIndex < quizQuestions.length ? quizQuestions[currentIndex] : null

  const correctAnswers = answerRecords.filter((record) => record.isCorrect).length
  const totalAnswered = answerRecords.length
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0

  // Group incorrect answers by category for the summary
  const incorrectByTag = useMemo(() => {
    if (answerRecords.length === 0) return {}

    const result: Record<string, number> = {}

    answerRecords.forEach((record) => {
      if (!record.isCorrect) {
        const flashcard = allFlashcards.find((f) => f.id === record.flashcardId)
        if (flashcard) {
          flashcard.tags.forEach((tag) => {
            result[tag] = (result[tag] || 0) + 1
          })
        }
      }
    })

    return result
  }, [answerRecords, allFlashcards])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Quiz</h1>
      </div>

      {!quizStarted ? (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{retryMode ? "Retry Incorrect Answers" : "Create a Quiz"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm mb-2">Select one or more tags to create a quiz from your flashcards</p>

              <div className="flex flex-wrap gap-2 mb-3 p-2 bg-muted/30 rounded-md min-h-[50px]">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer px-2 py-1 text-xs bg-secondary hover:bg-secondary/80"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
                {selectedTags.length === 0 && <p className="text-xs text-muted-foreground">No tags selected</p>}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    Select Tags
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
                  {allTags.length > 0 ? (
                    allTags.map((tag) => (
                      <DropdownMenuCheckboxItem
                        key={tag}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={() => toggleTag(tag)}
                      >
                        {tag}
                      </DropdownMenuCheckboxItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm">No tags available</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button onClick={startQuiz} disabled={selectedTags.length === 0} className="w-full">
              Start Quiz
            </Button>
          </CardFooter>
        </Card>
      ) : isQuizComplete ? (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{retryMode ? "Retry Complete" : "Quiz Complete"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Your Score</h3>
                <div className="text-xl font-bold">
                  {correctAnswers}/{totalAnswered} ({accuracy}%)
                </div>
              </div>

              <Progress value={accuracy} className="h-2 mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/30 p-3 rounded-md">
                  <h4 className="font-medium text-sm mb-2">Performance Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Correct answers:</span>
                      <span className="font-medium text-green-500">{correctAnswers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Incorrect answers:</span>
                      <span className="font-medium text-red-500">{totalAnswered - correctAnswers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span className="font-medium">{accuracy}%</span>
                    </div>
                  </div>
                </div>

                {Object.keys(incorrectByTag).length > 0 && (
                  <div className="bg-muted/30 p-3 rounded-md">
                    <h4 className="font-medium text-sm mb-2">Areas to Review</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(incorrectByTag)
                        .sort((a, b) => b[1] - a[1])
                        .map(([tag, count]) => (
                          <div key={tag} className="flex justify-between">
                            <span>{tag}:</span>
                            <span className="font-medium">{count} incorrect</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {!retryMode && totalAnswered - correctAnswers > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-md mb-4">
                  <h4 className="font-medium flex items-center text-amber-600 dark:text-amber-400 text-sm mb-1">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Retry Incorrect Answers
                  </h4>
                  <p className="text-xs mb-2">
                    You got {totalAnswered - correctAnswers} questions wrong. Would you like to retry them?
                  </p>
                  <Button variant="outline" size="sm" onClick={startRetryQuiz} className="w-full">
                    Retry Incorrect Questions
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Question Details</h4>
                {answerRecords.map((record, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-md border text-sm ${
                      record.isCorrect ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {record.isCorrect ? (
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{record.question}</p>
                        {!record.isCorrect && (
                          <>
                            <p className="text-xs text-red-500 mt-1">Your answer: {record.userAnswer}</p>
                            <p className="text-xs text-green-500 mt-1">Correct answer: {record.correctAnswer}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={resetQuiz}>
              New Quiz
            </Button>
            <Button size="sm" onClick={() => router.push("/flashcards")}>
              Review Flashcards
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="max-w-xl mx-auto">
          <div className="mb-3 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {quizQuestions.length}
            </div>
            <Button variant="ghost" size="sm" onClick={resetQuiz} className="h-8 px-2">
              Cancel
            </Button>
          </div>

          <Progress value={(currentIndex / quizQuestions.length) * 100} className="h-1.5 mb-4" />

          {currentQuestion ? (
            <Card
              className={`mb-4 shadow-sm transition-all duration-300 ${
                answerSubmitted
                  ? selectedOption === currentQuestion.correctOptionIndex
                    ? "border-green-500 shadow-[0_0_0_1px_rgba(34,197,94,0.5)]"
                    : "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]"
                  : ""
              }`}
            >
              <CardContent className="p-4">
                <div>
                  <h3 className="text-lg font-medium mb-4 text-center">{currentQuestion.flashcard.front}</h3>

                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        className={`w-full text-left p-3 rounded-md border transition-all ${
                          selectedOption === index
                            ? answerSubmitted
                              ? index === currentQuestion.correctOptionIndex
                                ? "bg-green-500/10 border-green-500"
                                : "bg-red-500/10 border-red-500"
                              : "bg-primary/10 border-primary"
                            : answerSubmitted && index === currentQuestion.correctOptionIndex
                              ? "bg-green-500/10 border-green-500"
                              : "bg-muted/30 border-muted-foreground/20 hover:bg-muted"
                        }`}
                        onClick={() => handleOptionSelect(index)}
                        disabled={answerSubmitted}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 text-xs ${
                              selectedOption === index
                                ? answerSubmitted
                                  ? index === currentQuestion.correctOptionIndex
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                  : "bg-primary text-primary-foreground"
                                : "border border-muted-foreground/30"
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className="text-sm" dangerouslySetInnerHTML={{ __html: option }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 border-t">
                {answerSubmitted ? (
                  <div
                    className={`w-full text-center font-medium ${
                      selectedOption === currentQuestion.correctOptionIndex ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {selectedOption === currentQuestion.correctOptionIndex ? (
                      <div className="flex items-center justify-center">
                        <Check className="mr-1 h-4 w-4" />
                        Correct!
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-center">
                          <X className="mr-1 h-4 w-4" />
                          Incorrect
                        </div>
                        <div className="text-xs mt-1 text-muted-foreground">
                          The correct answer was: Option {String.fromCharCode(65 + currentQuestion.correctOptionIndex)}
                        </div>
                      </div>
                    )}

                    {currentIndex < quizQuestions.length - 1 && (
                      <div className="text-xs text-muted-foreground mt-3 animate-pulse flex items-center justify-center">
                        <ArrowRight className="mr-1 h-3 w-3" />
                        Next question coming up...
                      </div>
                    )}
                  </div>
                ) : (
                  <Button onClick={handleSubmitAnswer} disabled={selectedOption === null} className="w-full">
                    Submit Answer
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card className="mb-4 p-4 text-center">
              <p>No questions available. Please try again.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
