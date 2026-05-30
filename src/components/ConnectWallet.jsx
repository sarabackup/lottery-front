import { useState, useEffect } from "react";
import JoinGame from "./JoinGame";
import { getParticipants, checkNetwork, getContract } from "../utils/contract";

function ConnectWallet() {
    const [account, setAccount] = useState("");
    const [participants, setParticipants] = useState(0);

    useEffect(() => {
        const savedAccount = localStorage.getItem("walletAddress");

        if (savedAccount) {
            setAccount(savedAccount);
            loadParticipants();
        }
    }, []);

    useEffect(() => {
        let contract;

        const listenJoined = async () => {
            contract = await getContract();

            contract.on("Joined", async () => {
                await loadParticipants();
            });
        };

        listenJoined();

        return () => {
            if (contract) {
                contract.removeAllListeners("Joined");
            }
        };
    }, []);

    const loadParticipants = async () => {
        try {
            const players = await getParticipants();
            setParticipants(players);
        } catch (err) {
            console.error(err);
        }
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                alert("Install MetaMask");
                return;
            }
            const isSepolia = await checkNetwork();

            if (!isSepolia) {
                alert("Switch to your MetaMask into Sepolia network");
                return;
            }

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            const walletAddress = accounts[0];

            setAccount(walletAddress);

            localStorage.setItem(
                "walletAddress",
                walletAddress
            );

            await loadParticipants();
        } catch (err) {
            console.error(err);
        }
    };

    const disconnectWallet = () => {
        localStorage.removeItem("walletAddress");
        setAccount("");
        // setParticipants(0);
    };

    return (
        <>
            {!account && (
                <button
                    className="btn btn-primary"
                    onClick={connectWallet}
                >
                    Connect Wallet
                </button>
            )}

            {account && (
                <div>
                    <p>Connected Account: {account}</p>

                    <p>
                        Participants:
                        {" "}
                        {participants || 0}
                        {" "}
                        / 3
                    </p>

                    {/* <JoinGame /> */}
                    <JoinGame  />
                    <p></p>

                    <button
                        className="btn btn-danger mt-2"
                        onClick={disconnectWallet}
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </>
    );
}

export default ConnectWallet;