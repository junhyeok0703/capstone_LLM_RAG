import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import LoadingOverlay from "./LoadingOverlay";
import Modal from "./Modal";
import "./Quote_page.css";

function Quote_page() {
  const [inputText, setInputText] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [quoteData, setQuoteData] = useState(null);
  const [selectedQuoteDetails, setSelectedQuoteDetails] = useState(null);
  const [quoteList, setQuoteList] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [previousQuotes, setPreviousQuotes] = useState([]);
  const [showAllQuotes, setShowAllQuotes] = useState(false);
  const [firstData, setFirstData] = useState("");
  const [selectedQuotes, setSelectedQuotes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [quoteInputText, setQuoteInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);
  const chatContainerRef = useRef(null);

  const toggleQuoteSelection = (quote) => {
    if (selectedQuotes.includes(quote)) {
      setSelectedQuotes(selectedQuotes.filter((q) => q !== quote));
    } else if (selectedQuotes.length < 2) {
      setSelectedQuotes([...selectedQuotes, quote]);
    }
  };

  useEffect(() => {
    const storedQuotes = localStorage.getItem("quoteHistory");
    if (storedQuotes) {
      setPreviousQuotes(JSON.parse(storedQuotes));
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatLog]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (e.target.value.trim() !== "") {
      setErrorMessage("");
    }
  };

  const handleQuoteInputChange = (e) => {
    setQuoteInputText(e.target.value);
    if (e.target.value.trim() !== "") {
      setErrorMessage("");
    }
  };

  const handleSubmit = async () => {
    if (inputText.trim() === "") {
      setErrorMessage("견적을 먼저 추천받으세요.");
      return;
    }
    setErrorMessage("");

    setLoading(true);

    const newChatLog = [...chatLog, { type: "user", text: inputText }];
    setChatLog(newChatLog);
    setInputText("");

    try {
      const response = await axios.post("http://localhost:5001/get-response", {
        origin_text: inputText,
        session_id: sessionId,
      });
      const { data, session_id, ...quoteDetails } = response.data;

      setSessionId(session_id);
      newChatLog.push({ type: "bot", text: data });
      setChatLog(newChatLog);

      if (Object.keys(quoteDetails).length > 2) {
        setQuoteData(quoteDetails);
        const newQuotes = [...previousQuotes, quoteDetails];
        setPreviousQuotes(newQuotes);
        localStorage.setItem("quoteHistory", JSON.stringify(newQuotes));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      newChatLog.push({ type: "bot", text: "서버 오류가 발생했습니다." });
      setChatLog(newChatLog);
    } finally {
      setLoading(false);
    }
  };

  const toggleShowQuotes = () => {
    setShowAllQuotes(!showAllQuotes);
  };

  const fetchQuotes = async () => {
    if (quoteInputText.trim() === "") {
      setErrorMessage("견적 요청을 입력하세요.");
      return;
    }
    setErrorMessage("");

    setLoading(true);

    setChatLog([]);
    setQuoteData(null);
    setSessionId(null);
    setSelectedQuoteDetails(null);
    setFirstData(quoteInputText);
    const newChatLog = [...chatLog, { type: "user", text: quoteInputText }];
    setChatLog(newChatLog);
    setQuoteInputText("");
    try {
      const response = await axios.post("http://localhost:5001/get-quotes", {
        origin_text: quoteInputText,
      });
      setQuoteList(response.data);
      setChatLog(newChatLog);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuote = async () => {
    if (selectedQuotes.length === 1) {
      const quote = selectedQuotes[0];
      const newChatLog = [
        ...chatLog,
        { type: "bot", text: "견적을 분석 후 추천 이유를 추출 중..." },
      ];
      setChatLog(newChatLog);

      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:5001/get-quote-detail",
          {
            quotes: quote,
            text: firstData,
          }
        );
        const { data, session_id, ...quoteDetails } = response.data;
        setQuoteList([]);
        setSelectedQuotes([]);
        setSessionId(session_id);
        newChatLog.push({ type: "bot", text: data });
        setChatLog(newChatLog);

        if (Object.keys(quoteDetails).length > 2) {
          setQuoteData(quoteDetails);
          const newQuotes = [...previousQuotes, quoteDetails];
          setPreviousQuotes(newQuotes);
          localStorage.setItem("quoteHistory", JSON.stringify(newQuotes));
        }
        setSelectedQuoteDetails(response);
      } catch (error) {
        console.error("Error fetching quote details:", error);
      } finally {
        setLoading(false);
      }
    } else {
      const quote1 = JSON.stringify(selectedQuotes[0]);
      const quote2 = JSON.stringify(selectedQuotes[1]);
      const newChatLog = [
        ...chatLog,
        { type: "bot", text: "견적을 비교 중..." },
      ];
      setChatLog(newChatLog);

      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:5001/compare_quote",
          {
            data1: quote1,
            data2: quote2,
          }
        );
        const data = response.data;
        const answer = data["data"];
        newChatLog.push({ type: "bot", text: answer });
        setChatLog(newChatLog);
        setSelectedQuotes([]);
      } catch (error) {
        console.error("compare error", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="app-container">
      {modalVisible && (
        <Modal onClose={() => setModalVisible(false)}>
          <h1>사용 설명서</h1>
          <p>처음에 견적을 추천받으세요.</p>
          <p>
            여러 견적 중에 선택해서 비교 버튼을 누르거나 가격과 부품을 보고
            마음에 드는 견적을 하나 골라서 실시간 컴퓨터 견적 상담을
            경험해보세요.
          </p>
          <p>
            오른쪽 밑에는 현재 선택한 견적의 상세 정보가 있고, 그 밑에는 이전에
            선택한 견적들이 기록되어 있습니다.
          </p>
          <button onClick={() => setModalVisible(false)}>확인</button>
        </Modal>
      )}
      {loading && <LoadingOverlay message="분석 중..." />}
      <div className="quote-request">
        <input
          type="text"
          value={quoteInputText}
          onChange={handleQuoteInputChange}
          placeholder="견적 요청을 입력하세요"
        />
        <button onClick={fetchQuotes}>견적 추천받기</button>
      </div>
      <div className="chat-section">
        <div className="chat-messages" ref={chatContainerRef}>
          {chatLog.map((entry, index) => (
            <div key={index} className={`chat-message ${entry.type}`}>
              <div
                className={`message-icon ${
                  entry.type === "user" ? "user-icon" : "bot-icon"
                }`}
              ></div>
              <div className={`message-content ${entry.type}`}>
                {entry.type === "user" ? "나: " : "견적봇: "} {entry.text}
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={
              sessionId ? "채팅을 입력하세요" : "견적을 먼저 추천받으세요"
            }
            disabled={!sessionId}
          />
          <button onClick={handleSubmit} disabled={!sessionId}>
            보내기
          </button>
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>
      <div className="quote-sections">
        <div className="quote-section">
          <h2>추천 받은 견적 목록</h2>
          {selectedQuotes.length > 0 && (
            <button onClick={handleSelectQuote} className="select-button">
              {selectedQuotes.length === 2 ? "비교" : "선택"}
            </button>
          )}
          {quoteList.length > 0 ? (
            quoteList.map((quote, index) => (
              <div
                key={index}
                className={`quote-card ${
                  selectedQuotes.includes(quote) ? "selected" : ""
                }`}
                onClick={() => toggleQuoteSelection(quote)}
              >
                <h3>견적 {index + 1}</h3>
                <p>
                  CPU: {quote.parts_price?.CPU?.제품명 ?? "N/A"} -{" "}
                  {quote.parts_price?.CPU?.가격 ?? "N/A"}
                </p>
                <p>
                  메인보드: {quote.parts_price?.메인보드?.제품명 ?? "N/A"} -{" "}
                  {quote.parts_price?.메인보드?.가격 ?? "N/A"}
                </p>
                <p>
                  메모리: {quote.parts_price?.메모리?.제품명 ?? "N/A"} -{" "}
                  {quote.parts_price?.메모리?.가격 ?? "N/A"}
                </p>
                <p>
                  그래픽 카드: {quote.parts_price?.그래픽카드?.제품명 ?? "N/A"}{" "}
                  - {quote.parts_price?.그래픽카드?.가격 ?? "N/A"}
                </p>
                <p>
                  SSD: {quote.parts_price?.SSD?.제품명 ?? "N/A"} -{" "}
                  {quote.parts_price?.SSD?.가격 ?? "N/A"}
                </p>
                <p>
                  케이스: {quote.parts_price?.케이스?.제품명 ?? "N/A"} -{" "}
                  {quote.parts_price?.케이스?.가격 ?? "N/A"}
                </p>
                <p>
                  파워 서플라이:{" "}
                  {quote.parts_price?.파워서플라이?.제품명 ?? "N/A"} -{" "}
                  {quote.parts_price?.파워서플라이?.가격 ?? "N/A"}
                </p>
                <p>
                  CPU 쿨러: {quote.parts_price?.CPU쿨러?.제품명 ?? "N/A"} -{" "}
                  {quote.parts_price?.CPU쿨러?.가격 ?? "N/A"}
                </p>
                <p>Total Price: {quote.total_price ?? "N/A"}</p>
              </div>
            ))
          ) : (
            <p>견적을 추천받으세요.</p>
          )}
        </div>
        <div className="quote-section">
          <h2>선택한 견적</h2>
          {quoteData ? (
            <div className="quote-card">
              <h3>선택한 견적 상세</h3>
              <p>
                CPU: {quoteData.cpu_name} - {quoteData.cpu_price}
              </p>
              <p>
                메인보드: {quoteData.mother_name} - {quoteData.mother_price}
              </p>
              <p>
                메모리: {quoteData.memory_name} - {quoteData.memory_price}
              </p>
              <p>
                그래픽 카드: {quoteData.gpu_name} - {quoteData.gpu_price}
              </p>
              <p>
                SSD: {quoteData.ssd_name} - {quoteData.ssd_price}
              </p>
              <p>
                케이스: {quoteData.case_name} - {quoteData.case_price}
              </p>
              <p>
                파워 서플라이: {quoteData.power_name} - {quoteData.power_price}
              </p>
              <p>
                CPU 쿨러: {quoteData.cpu_Cooler_name} -{" "}
                {quoteData.cpu_Cooler?.price ?? "N/A"}
              </p>
              <p>총 가격: {quoteData.total_price}</p>
            </div>
          ) : (
            <p>견적을 선택하세요.</p>
          )}
        </div>
        <div className="quote-section">
          <h2>이전 견적 기록</h2>
          <div className="previous-quotes">
            {previousQuotes.length > 0 ? (
              previousQuotes.map((quote, index) => (
                <div key={index} className="quote-card">
                  <h3>이전 견적 {index + 1}</h3>
                  <p>
                    CPU: {quote.cpu_name} - {quote.cpu_price}
                  </p>
                  <p>
                    메인보드: {quote.mother_name} - {quote.mother_price}
                  </p>
                  <p>
                    메모리: {quote.memory_name} - {quote.memory_price}
                  </p>
                  <p>
                    그래픽 카드: {quote.gpu_name} - {quote.gpu_price}
                  </p>
                  <p>
                    SSD: {quote.ssd_name} - {quote.ssd_price}
                  </p>
                  <p>
                    케이스: {quote.case_name} - {quote.case_price}
                  </p>
                  <p>
                    파워 서플라이: {quote.power_name} - {quote.power_price}
                  </p>
                  <p>
                    CPU 쿨러: {quote.cpu_Cooler_name} -{" "}
                    {quote.cpu_Cooler?.price ?? "N/A"}
                  </p>
                  <p>총 가격: {quote.total_price}</p>
                </div>
              ))
            ) : (
              <p>이전 견적이 없습니다.</p>
            )}
          </div>
          {previousQuotes.length > 2 && (
            <button onClick={toggleShowQuotes}>
              {showAllQuotes ? "숨기기" : "더 보기"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Quote_page;
