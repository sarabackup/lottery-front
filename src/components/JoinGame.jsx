import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../utils/contract";

function JoinGame() {
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    let contract;

    const listenForWinner = async () => {
      try {
        contract = await getContract();

        contract.on(
          "WinnerSelected",
          (winnerAddress, prize, event) => {
            console.log(event);

            setWinner({
              address: winnerAddress,
              prize: ethers.formatEther(prize),
              txHash: event.log.transactionHash,
            });
          }
        );
      } catch (err) {
        console.error(err);
      }
    };

    listenForWinner();

    return () => {
      if (contract) {
        contract.removeAllListeners("WinnerSelected");
      }
    };
  }, []);

  const joinGame = async () => {
    try {
      const contract = await getContract();

      const tx = await contract.joinGame({
        value: ethers.parseEther("0.0001"),
      });

      // await tx.wait();
       const receipt = await tx.wait();

      console.log("tx hash", receipt.hash);

      alert("Joined Successfully");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button
        className="btn btn-dark"
        onClick={joinGame}
      >
        Join Game
      </button>

      {winner && (
        <div className="mt-3 alert alert-success">
          <h5>🎉 Winner Selected!</h5>
          <p>
            <strong>Address:</strong>
            {" "}
            {winner.address}
          </p>
          <p>
            <strong>Prize Won:</strong>
            {" "}
            {winner.prize} ETH
          </p>
          <p>
            <strong>Transaction:</strong>{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${winner.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Etherscan
            </a>
          </p>
        </div>
      )}
    </>
  );
}

export default JoinGame;