"use client";

import robot from "@/public/robot.json";
import warning from "@/public/warning.json";
import success from "@/public/success.json";
import wallet from "@/public/Crypto-Wallet.json";

import Lottie from "lottie-react";

export const RobotLottie = () => (
  <Lottie 
    style={{ width: '320px', height: '320px' }} 
    animationData={robot} 
    loop={true} 
  />
);

export const CryptoWalletLottie = () => (
  <Lottie
    style={{ width: '320px', height: '320px' }}
    animationData={wallet}
    loop={true}
  />
);

export const SuccessLottie = () => (
  <Lottie
    style={{ width: '320px', height: '320px' }}
    animationData={success}
    loop={true}
  />
)

export const WarningLottie = () => (
  <Lottie
    style={{ width: '320px', height: '320px' }}
    animationData={warning}
    loop={true}
  />
)