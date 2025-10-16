"use client";

import animation from "@/public/Crypto-Wallet.json";
import Lottie from "lottie-react";

const CryptoWalletLottie = () => (<>
<div className="max-w-52">
<Lottie width={30} height={30} animationData={animation} loop={true} />
</div>
</>);

export default CryptoWalletLottie;