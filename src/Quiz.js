import React, { useState, useEffect } from "react";

const quizData = [
  {
    id: 1,
    question: "What does HTML stand for?",
    options: [
      "Hyperlinks and Text Markup Language",
      "Hyper Text Markup Language",
      "Home Tool Markup Language",
      "Hyperlinking Textual Management Language"
    ],
    answer: "Hyper Text Markup Language"
  },
  {
    id: 2,
    question: "Which CSS property controls the text size?",
    options: ["font-style", "text-size", "font-size", "text-style"],
    answer: "font-size"
  },
  {
    id: 3,
    question: "What does the JavaScript 'DOM' stand for?",
    options: [
      "Document Object Model",
      "Data Object Management",
      "Digital Ordinance Model",
      "Desktop Object Management"
    ],
    answer: "Document Object Model"
  },
  {
    id: 4,
    question: "Which tag is used to display an image in HTML?",
    options: ["<img>", "<image>", "<pic>", "<src>"],
    answer: "<img>"
  },
  {
    id: 5,
    question: "Which array method adds an item to the end?",
    options: ["push()", "add()", "append()", "insert()"],
    answer: "push()"
  },
  {
    id: 6,
    question: "Which CSS property is used to change text color?",
    options: ["font-color", "text-color", "color", "fgcolor"],
    answer: "color"
  },
  {
    id: 7,
    question: "What keyword declares a constant variable in JavaScript?",
    options: ["var", "let", "static", "const"],
    answer: "const"
  },
  {
    id: 8,
    question: "Which HTML tag creates a hyperlink?",
    options: ["<a>", "<link>", "<href>", "<url>"],
    answer: "<a>"
  },
  {
    id: 9,
    question: "CSS stands for?",
    options: [
      "Creative Style System",
      "Cascading Style Sheets",
      "Computer Styled Sections",
      "Coded Style Syntax"
    ],
    answer: "Cascading Style Sheets"
  },
  {
    id: 10,
    question: "Which JavaScript method converts JSON into an object?",
    options: [
      "JSON.stringify()",
      "JSON.parse()",
      "JSON.objectify()",
      "parse.JSON()"
    ],
    answer: "JSON.parse()"
  }
];

const Quiz = () => {
  const [remainingQuestions, setRemainingQuestions] = useState([...quizData]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selected, setSelected] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  // Pick a random question on first load and after each answer:
  useEffect(() => {
    if (remainingQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
      setCurrentQuestion(remainingQuestions[randomIndex]);
    }
  }, [remainingQuestions]);

  const handleSelect = (option) => {
    setSelected(option);
    setShowAnswer(true);

    // Remove the question from the list after 2 seconds
    setTimeout(() => {
      const filtered = remainingQuestions.filter(
        (q) => q.id !== currentQuestion.id
      );
      setRemainingQuestions(filtered);
      setSelected("");
      setShowAnswer(false);
    }, 2000);
  };

  if (!currentQuestion) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        🎉 Quiz Completed!
      </h2>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h3>{currentQuestion.question}</h3>

      {currentQuestion.options.map((opt, index) => (
        <button
          key={index}
          onClick={() => handleSelect(opt)}
          style={{
            display: "block",
            width: "100%",
            marginTop: "10px",
            padding: "10px",
            background:
              showAnswer && opt === currentQuestion.answer
                ? "lightgreen"
                : selected === opt
                ? "#ffc107"
                : "#f8f9fa",
            border: "1px solid #ccc",
            cursor: "pointer",
            borderRadius: "5px"
          }}
        >
          {opt}
        </button>
      ))}

      {showAnswer && (
        <p style={{ marginTop: "20px", color: "green", fontWeight: "bold" }}>
          Correct Answer: {currentQuestion.answer}
        </p>
      )}

      <p style={{ marginTop: "15px", color: "#888" }}>
        Remaining Questions: {remainingQuestions.length - 1}
      </p>
    </div>
  );
};

export default Quiz;
