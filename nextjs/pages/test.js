import { predictionWorldAddress } from "@/config";
import PredictionWorld from "@/utils/abis/PredictionWorld.json";
import DownloadingIcon from "@mui/icons-material/Downloading";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import { IconButton } from "@mui/material";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";

const MARKET_FILTERING_STATUS = {
    ALL: 0,
    NOT_CLOSED: 1,
    CLOSED: 2
};

const MARKET_FILTERING_WITH_TEST = {
    YES: true,
    NO: false
};

const MARKET_ORDER_TYPE = {
    ASC: false,
    DESC: true
};

const PAGE_SIZE = 5;

// // Mumbai
// const PROVIDER = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/zuA4YikAUhYUlQw2PpucJx1jsv5eVysb");
// Mainnet
const PROVIDER = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/B8ncZIIjNn8eul-QPcOcgBac3pFdOH6_");

const PREDICTION_WORLD_CONTRACT = new ethers.Contract(predictionWorldAddress, PredictionWorld.abi, PROVIDER);

export default function Test() {
    const [markets, setMarkets] = useState([]);
    const [nextCursor, setNextCursor] = useState(0);
    const [finished, setFinished] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async (cursor) => {
        setLoading(true);

        const response = await PREDICTION_WORLD_CONTRACT.fetchMarkets(
            cursor,
            PAGE_SIZE,
            MARKET_FILTERING_STATUS.NOT_CLOSED,
            MARKET_FILTERING_WITH_TEST.YES,
            MARKET_ORDER_TYPE.DESC
        );
        const nextMarkets = response[0];
        const nextCursor = response[1];

        setMarkets((pre) => [...pre, ...nextMarkets]);
        setNextCursor(nextCursor);
        setFinished(nextMarkets.length < PAGE_SIZE);
        setLoading(false);
    }, []);

    useEffect(() => {
        const fetchFirst = async () => {
            const total = await PREDICTION_WORLD_CONTRACT.totalMarkets();
            await fetchData(total);
        };
        fetchFirst();
    }, [fetchData]);

    return (
        <>
            <div>Open Markets: {markets.length}</div>
            <IconButton disabled={loading || finished} onClick={() => fetchData(nextCursor)} size="small" aria-label="get more">
                More <ReadMoreIcon fontSize="large" />
            </IconButton>
            {loading && <DownloadingIcon />}
            {markets.map((market, index) => (
                <div key={index}>Q: {market.info.question}</div>
            ))}
        </>
    );
}
