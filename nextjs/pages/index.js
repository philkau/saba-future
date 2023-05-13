import dynamic from "next/dynamic";
import { Suspense } from "react";
import Head from "next/head";
import { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";

import styles from "../styles/Home.module.css";
import Filter from "@/components/Filter";
import { predictionWorld3Address, sureToken3Address } from "@/config";
import SURE from "../utils/abis/SureToken3.json";
import PredictionWorld from "../utils/abis/PredictionWorld3.json";
import { BiconomyAccountContext } from "@/contexts/BiconomyAccountContext";
import MarketCard from "@/components/MarketCard";

const BiconomyNavbar = dynamic(
    () => import("../components/BiconomyNavbar").then((res) => res.default),
    {
        ssr: false,
    }
);

export default function Home() {
    const [balance, setBalance] = useState(0);
    const {account, socialLoginSDK} = useContext(BiconomyAccountContext);
    const [markets, setMarkets] = useState([]);
    const getBalance = async () => {
        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(
                socialLoginSDK.provider
            );
            const signer = provider.getSigner();
            const sureTokenContract = new ethers.Contract(
                sureToken3Address,
                SURE.abi,
                signer
            );
            const account = await signer.getAddress();

            let balance = await sureTokenContract.balanceOf(account);
            setBalance(ethers.utils.commify(balance));
        } catch (error) {
            console.log(`Error getting balance, ${error}`);
        }
    }
    const getMarkets = async () => {
        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(
                socialLoginSDK.provider
            );
            const signer = provider.getSigner();
            const predictionWorldContract = new ethers.Contract(
                predictionWorld3Address,
                PredictionWorld.abi,
                signer
            );
            
            let marketCount = await predictionWorldContract.totalMarkets();
            let markets = [];
            for (let i = 0; i < marketCount; i++) {
                let market = await predictionWorldContract.markets(i);
                console.log(i);
                console.log(`market.id: ${market.info.question}`);
                markets.push({
                    id: market.id,
                    question: market.info.question,
                    imageHash: market.info.creatorImageHash,
                    totalAmount: market.totalAmount,
                    totalYesAmount: market.totalYesAmount,
                    totalNoAmount: market.totalNoAmount,
                    marketClosed: market.marketClosed,
                });
            }
            setMarkets(markets);
        } catch (error) {
            console.log(`Error getting market: ${error}`);
        }
    }


    useEffect(() => {
        getBalance();
        getMarkets();
    }, [account]);

    return (
        <div className={styles.container}>
            <Head>
                <title>Prediction World</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Suspense fallback={<div>Loading...</div>}>
                <BiconomyNavbar />
            </Suspense>
            <main className="w-full flex flex-col sm:flex-row flex-wrap sm:flex-nowrap py-4 flex-grow max-w-5xl">
                <div className="w-full flex flex-col flex-grow pt-1">
                    <div className="relative text-gray-500 focus-within:text-gray-400 w-full">
                        <span className="absolute inset-y-0 left-0 flex items-center px-3">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                className="w-5 h-5"
                            >
                                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </span>
                        <input
                            type="search"
                            name="q"
                            className="w-full py-3 px-3 text-base text-gray-700 bg-gray-100 rounded-md pl-10 focus:outline-none"
                            placeholder="Search markets..."
                            autoComplete="off"
                        />
                    </div>
                    <div className="flex flex-row space-x-2 md:space-x-5 items-center flex-wrap mt-4">
                        <Filter
                            list={["All", "Crypto", "Football", "Covid 19", "OneSeal"]}
                            activeItem="All"
                            category="Category"
                            onChange={() => { }}
                        />
                        <Filter
                            list={["Volume", "Newest", "Expiring"]}
                            activeItem="Volume"
                            category="Sort By"
                            onChange={() => { }}
                        />
                    </div>
                    You have: {balance} SURE tokens
                    <br />
                    <span className="font-bold my-3 text-lg">Market</span>
                    <div>Open Markets</div>
                    <div className="flex flex-wrap overflow-hidden sm:-mx-1 md:-mx-2">
                    {markets.filter((market) => !market.marketClosed).map((market) => {
                        return (
                            <div>
                            <MarketCard
                                id={market.id}
                                key={market.id}
                                title={market.question}
                                totalAmount={market.totalAmount}
                                totalYesAmount={market.totalYesAmount}
                                totalNoAmount={market.totalNoAmount}
                            />
                            </div>
                        );
                    })}
                    </div>
                    <div>Closed Markets</div>
                    <div className="flex flex-wrap overflow-hidden sm:-mx-1 md:-mx-2">
                        {markets.filter((market) => market.marketClosed).map((market) => {
                            return (
                                <div>
                                <MarketCard
                                    id={market.id}
                                    key={market.id}
                                    title={market.question}
                                    totalAmount={market.totalAmount}
                                    totalYesAmount={market.totalYesAmount}
                                    totalNoAmount={market.totalNoAmount}
                                />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}

/*
const SocialLoginDynamic = dynamic(
    () => import("../components/SmartContractWallet").then((res) => res.default),
    {
        ssr: false,            
    }
);
<Suspense fallback={<div>Loading...</div>}>         
    <SocialLoginDynamic />
</Suspense> 
*/