/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import CustomButton from "./CustomButton";
import Question from "./Question";
import Information from "./Information";
import Configuration from "./Configuration";

function Wizard({ call, setHistory }) {
  const applyURL = import.meta.env?.VITE_APPLY_CONFIGURATION_URL;

  const [isImported, setIsImported] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState([]);
  const [message, setMessage] = useState({ type: "info", msg: "Preparing configurator for the model" });
  const [configuration, setConfiguration] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [constraintMsg, setConstraintMsg] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const prevQuestionRef = useRef(null);

  function historyToMap(history) {
    const map = {};
    if (Array.isArray(history)) {
      history.forEach(h => { map[h.feature] = h.selected; });
    }
    return map;
  }

  useEffect(() => {
    call("startConfigurator").then((result) => {
      setMessage(null);
      setCurrentQuestion({...result});
      setTotalQuestions(result.totalQuestions || 0);
      setQuestionIndex(0);
      setHistory({});
      setIsImported(true);
      triggerAnimation();
    });
    return () => setHistory(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function triggerAnimation() {
    setAnimate(false);
    setTimeout(() => setAnimate(true), 10);
  }

  async function answerQuestion() {
    if (!isImported) return;
    const results = await call("answerQuestion", selectedAnswer);
    if (results.valid) {
      if (currentQuestion) {
        const answerNames = selectedAnswer.map((idx) => {
          const option = currentQuestion.possibleOptions.find((o) => o.id === idx);
          return option ? option.name : idx;
        });
        setTimeline((prev) => [
          ...prev,
          {
            question: currentQuestion.currentQuestion,
            answer: answerNames,
            index: questionIndex,
          },
        ]);
      }
      if (results.configuration) {
        setConfiguration(results.configuration);
        setMessage({ type: "success", msg: "Configuration finished successfully!" });
        setCurrentQuestion(null);
        setHistory(historyToMap(results.history));
      } else {
        triggerAnimation();
        setCurrentQuestion(results.nextQuestion);
        setQuestionIndex((prev) => prev + 1);
        setMessage(null);
        setHistory(historyToMap(results.history));
        if (results.constraintInfo) {
          setConstraintMsg(results.constraintInfo);
          setTimeout(() => setConstraintMsg(null), 4000);
        } else {
          setConstraintMsg(null);
        }
      }
    } else {
      setMessage({ type: "error", msg: results.contradiction?.msg || "Invalid selection" });
    }
    setSelectedAnswer([]);
  }

  async function undoAnswer() {
    if (!isImported) return;
    const results = await call("undoAnswer");
    triggerAnimation();
    setCurrentQuestion(results);
    if (configuration) setConfiguration(null);
    setSelectedAnswer([]);
    setMessage(null);
    setHistory(historyToMap(results?.history));
    setQuestionIndex((prev) => Math.max(0, prev - 1));
    setTimeline((prev) => prev.slice(0, -1));
    setConstraintMsg(null);
  }

  async function restartConfigurator() {
    const result = await call("startConfigurator");
    setMessage(null);
    setCurrentQuestion(result);
    setTotalQuestions(result.totalQuestions || 0);
    setQuestionIndex(0);
    setHistory({});
    setSelectedAnswer([]);
    setTimeline([]);
    setConfiguration(null);
    setConstraintMsg(null);
  }

  function downloadConfiguration() {
    if (!configuration) {
      setMessage({ type: "error", msg: "No configuration available to download." });
      return;
    }
    const jsonData = JSON.stringify(configuration, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "configuration.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function nextQuestion() {
    if (isImported && currentQuestion) {
      await answerQuestion();
    } else {
      downloadConfiguration();
    }
  }

  async function previousQuestion() {
    if (isImported) await undoAnswer();
  }

  const progress = totalQuestions > 0 ? Math.round((questionIndex / totalQuestions) * 100) : 0;

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {isImported && !configuration && totalQuestions > 0 && (
        <div className="px-4 pt-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Question {questionIndex + 1} of {totalQuestions}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden gap-2 m-2">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-neutral-300 dark:bg-gray-700 flex flex-col flex-grow rounded-2xl p-4 overflow-auto">
            {constraintMsg && (
              <div className="mb-3 px-3 py-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
                ⚠️ {constraintMsg}
              </div>
            )}
            {message && <Information type={message.type} msg={message.msg} />}
            {currentQuestion && (
              <div className={`transition-all duration-300 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                <Question
                  title={currentQuestion.currentQuestion}
                  attrs={currentQuestion.currentQuestionAttrs}
                  options={currentQuestion.possibleOptions}
                  questionType={currentQuestion.currentQuestionType}
                  selected={selectedAnswer}
                  onUpdate={setSelectedAnswer}
                />
              </div>
            )}
            {configuration && <Configuration configuration={configuration} />}
          </div>
        </div>

        {isImported && timeline.length > 0 && (
          <div className="w-56 flex flex-col gap-2 overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                History
              </h3>
              <ul className="flex flex-col gap-2">
                {timeline.map((entry, i) => (
                  <li key={i} className="flex flex-col gap-0.5 border-l-2 border-blue-400 pl-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                      {entry.question}
                    </span>
                    <span className="text-xs text-gray-400 truncate">
                      {Array.isArray(entry.answer) ? entry.answer.join(", ") : entry.answer}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="flex p-4 gap-2">
        <CustomButton active={isImported} onClick={previousQuestion}>
          Previous
        </CustomButton>
        <CustomButton active={isImported} onClick={nextQuestion}>
          {configuration ? (applyURL ? "Apply configuration" : "Download configuration") : "Next"}
        </CustomButton>
        <CustomButton active={isImported} onClick={restartConfigurator}>
          Restart
        </CustomButton>
      </div>
    </div>
  );
}

export default Wizard;