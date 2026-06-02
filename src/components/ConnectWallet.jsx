import { useState, useEffect } from "react";
import JoinGame from "./JoinGame";
import {
    getParticipants,
    checkNetwork,
    getContract,
} from "../utils/contract";

function ConnectWallet() {
    const [account, setAccount] = useState("");
    const [participants, setParticipants] = useState(0);

    const ENTRY_FEE = 0.0001;
    const MAX_PLAYERS = 3;

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
            try {
                contract = await getContract();

                contract.on("Joined", async () => {
                    await loadParticipants();
                });
            } catch (error) {
                console.error(error);
            }
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
            setParticipants(Number(players));
        } catch (err) {
            console.error(err);
        }
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                alert("Please install MetaMask");
                return;
            }

            const isSepolia = await checkNetwork();

            if (!isSepolia) {
                alert("Please switch MetaMask to the Sepolia network");
                return;
            }

            let provider = window.ethereum;

            // if (window.ethereum.providers) {
            //     provider =
            //         window.ethereum.providers.find(
            //             (p) => p.isMetaMask
            //         ) || window.ethereum;
            // }

            const accounts = await provider.request({
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
            console.error("Wallet connection error:", err);
        }
    };

    const disconnectWallet = () => {
        localStorage.removeItem("walletAddress");
        setAccount("");
    };

    const currentPrizePool = (
        participants * ENTRY_FEE
    ).toFixed(4);

    const maxPrizePool = (
        MAX_PLAYERS * ENTRY_FEE
    ).toFixed(4);

    return (
        <div className="container mt-4">
            {/* Game Information */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h2 className="mb-3">ETH Lottery Game</h2>

                    <p>
                        Join the lottery for a chance to win
                        the entire prize pool.
                    </p>

                    <h5>How It Works</h5>

                    <ol>
                        <li>
                            Connect your MetaMask wallet.and switch to Sepolia network if not already connected.
                        </li>
                        <li>
                            Pay{" "}
                            <strong>
                                {ENTRY_FEE} Sepolia ETH
                            </strong>{" "}
                            to join.
                        </li>
                        <li>
                            Wait until{" "}
                            <strong>
                                {MAX_PLAYERS} players
                            </strong>{" "}
                            have joined.
                        </li>
                        <li>
                            The smart contract randomly
                            selects a winner.
                        </li>
                        <li>
                            The winner receives the full
                            prize pool.
                        </li>
                    </ol>

                    <hr />

                    <div className="row">
                        <div className="col-md-3">
                            <strong>Entry Fee</strong>
                            <br />
                            {ENTRY_FEE} Sepolia ETH
                        </div>

                        <div className="col-md-3">
                            <strong>Max Players</strong>
                            <br />
                            {MAX_PLAYERS}
                        </div>

                        <div className="col-md-3">
                            <strong>Current Pool</strong>
                            <br />
                            {currentPrizePool} Sepolia ETH
                        </div>

                        <div className="col-md-3">
                            <strong>Max Prize</strong>
                            <br />
                            {maxPrizePool} Sepolia ETH
                        </div>
                    </div>
                </div>
            </div>

            {/* Wallet Section */}
            {!account ? (
                <div className="text-center">
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={connectWallet}
                    >
                        Connect MetaMask Wallet
                    </button>
                </div>
            ) : (
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h4>Wallet Connected</h4>

                        <p>
                            <strong>Address:</strong>
                            <br />
                            {account}
                        </p>

                        <div className="alert alert-info">
                            <strong>
                                Players Joined:
                            </strong>{" "}
                            {participants} / {MAX_PLAYERS}
                            <br />
                            <strong>
                                Current Prize Pool:
                            </strong>{" "}
                            {currentPrizePool} Sepolia ETH
                        </div>

                        {participants < MAX_PLAYERS ? (
                            <JoinGame />
                        ) : (
                            <div className="alert alert-success">
                                🎉 Game Full! Winner
                                selection in progress.
                            </div>
                        )}

                        <button
                            className="btn btn-outline-danger mt-3"
                            onClick={disconnectWallet}
                        >
                            Disconnect Wallet
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ConnectWallet;