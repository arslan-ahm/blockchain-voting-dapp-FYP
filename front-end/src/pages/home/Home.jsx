import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { decrement, increment } from "../../store/slices/counter";

const Home = () => {
  const { value } = useSelector((state) => state.counter);
  const dispatch = useDispatch();

  const handleIncrement = () => {
    dispatch(increment());
  };

  const handleDecrement = () => {
    dispatch(decrement());
  };

  return (
    <div>
      <h1 className="text-3xl font-bold underline text-center">Home</h1>
      <p className="text-center">Welcome to the home page!</p>

      <div className="flex justify-center items-center gap-4 mt-4">
        <button className="bg-blue-500 px-5 font-semibold text-5xl pb-2 rounded-4xl" onClick={handleIncrement}>+</button>
        <span className="text-xl ">{value}</span>
        <button className="bg-rose-500 px-6 font-semibold text-5xl pb-2 rounded-4xl" onClick={handleDecrement}>-</button>
      </div>
    </div>
  );
};

export default Home;
