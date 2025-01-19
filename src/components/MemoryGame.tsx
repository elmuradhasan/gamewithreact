import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "../store/themeSlice";
import { Button, Row, Col, Modal } from "antd";
import "../index.css"; // Tailwind styles
import { RootState } from "../store";

const themes = {
  fruits: ["🍎", "🍌", "🍇", "🍉", "🍒", "🍍"],
  animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊"],
  emojis: ["😀", "😁", "😂", "🤣", "😜", "🤩"],
};

const MemoryGameF: React.FC = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector(
    (state: RootState) => state.theme.currentTheme
  );

  const [cards, setCards] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [hasStarted, setHasStarted] = useState(false);
  useEffect(() => {
    const selectedValues = themes[currentTheme];
    const duplicatedCards = [...selectedValues, ...selectedValues];
    setCards(
      duplicatedCards
        .sort(() => Math.random() - 0.5)
        .map((value, index) => ({ id: index, value, flipped: false }))
    );
    setFlippedCards([]);
    setMatched([]);
    setMoves(0);
  }, [currentTheme]);
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setIsModalVisible(true); // Show modal when the game is completed
    }
  }, [matched, cards]);
  useEffect(() => {
    let timer: NodeJS.Timeout;
  
    if (hasStarted && timeLeft > 0 && !isModalVisible) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsModalVisible(true); // Show modal when time runs out
    }
  
    return () => clearInterval(timer); // Cleanup on unmount or reset
  }, [hasStarted, timeLeft, isModalVisible]);
  const handleCardClick = (index: number) => {
    if (!hasStarted) setHasStarted(true); // Start timer on first click
  
    if (flippedCards.length === 2 || matched.includes(index)) return;
  
    setFlippedCards((prev) => [...prev, index]);
    setMoves((prev) => prev + 1);
  
    if (flippedCards.length === 1) {
      const [firstIndex] = flippedCards;
      if (cards[firstIndex].value === cards[index].value) {
        setMatched((prev) => [...prev, firstIndex, index]);
      }
      setTimeout(() => setFlippedCards([]), 1000);
    }
  };
  
  const handleOk = () => {
    setIsModalVisible(false);
    setHasStarted(false); // Reset timer start flag
    setTimeLeft(120); // Reset timer
    const selectedValues = themes[currentTheme];
    const duplicatedCards = [...selectedValues, ...selectedValues];
    setCards(
      duplicatedCards
        .sort(() => Math.random() - 0.5)
        .map((value, index) => ({ id: index, value, flipped: false }))
    );
    setFlippedCards([]);
    setMatched([]);
    setMoves(0);
  };
  
  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-center mb-4">Memory Card Game</h1>
      <div className="flex justify-center gap-4 mb-6">
        {Object.keys(themes).map((theme) => (
          <Button
            key={theme}
            className="capitalize p-3"
            type={currentTheme === theme ? "primary" : "default"}
            onClick={() =>{
               dispatch(setTheme(theme))
               setIsModalVisible(false);
               setHasStarted(false); // Reset timer start flag
               setTimeLeft(120); // Reset timer
            }}
          >
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </Button>
        ))}
      </div>
      <div className="text-center mb-6">
        <p className="text-lg">Moves: {moves}</p>
        <p className="text-lg">Matches: {matched.length / 2}</p>
        <p className="text-lg text-red-500">
          Time Left: {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, "0")}
        </p>
      </div>

      <Row className="full-w flex justify-center align-center">
        <Row className="w-full flex justify-center items-center flex-wrap gap-4">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`cursor-pointer rounded-md shadow-lg transition-all duration-300 ${
                flippedCards.includes(index) || matched.includes(index)
                  ? "bg-green-200"
                  : "bg-gray-200"
              }`}
              style={{
                width: "80px", // Adjust card width
                height: "100px", // Adjust card height
              }}
              onClick={() => handleCardClick(index)}
            >
              <div className="text-3xl flex items-center justify-center h-full">
                {flippedCards.includes(index) || matched.includes(index)
                  ? card.value
                  : "❓"}
              </div>
            </div>
          ))}
        </Row>
      </Row>
      <Modal
        title={timeLeft === 0 ? "Time's Up!" : "Congratulations!"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText="New Game"
        cancelText="Close"
      >
        <p>
          {timeLeft === 0 ? "You ran out of time!" : "You found all the cards!"}
        </p>
        <p>Total Moves: {moves}</p>
      </Modal>
    </div>
  );
};

export default MemoryGameF;
