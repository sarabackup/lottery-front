

import { ethers } from "ethers";
import ABI from "../contracts/GameABI.json";
import { CONTRACT_ADDRESS } from "../config/contract";

export async function getContract() {
  const provider =
    new ethers.BrowserProvider(window.ethereum);

  const signer =
    await provider.getSigner();

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    ABI,
    signer
  );
}

export async function getParticipants() {
  try {
    const contract =
      await getContract();

    const participants =
      await contract.getParticipants();
    console.log(" participants:", participants.length);  

    return participants.length;
  } catch (err) {
    console.log(err);
    return 0;
  }
}

export async function checkNetwork() {
    const provider =new ethers.BrowserProvider(window.ethereum);

    const network = await provider.getNetwork();

    if (network.chainId !== 11155111n) {
    return false;
    }
    return network.chainId === 11155111n;
}

