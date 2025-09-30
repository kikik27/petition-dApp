"use client";

import * as animation from "@/public/Crypto-Wallet.json";
import { useLottie } from "lottie-react";

const CryptoWalletLottie = () => {
  const defaultOptions = {
    animationData: animation,
    loop: true,
  };

  const { View } = useLottie(defaultOptions);

  return (
    <>
      <div className="">
        <div className="w-full">{View}</div>
      </div>
    </>
  );
};

export default CryptoWalletLottie;