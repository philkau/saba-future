import { predictionWorldAddress } from "@/config";
import PredictionWorld from "@/utils/abis/PredictionWorld.json";
import DownloadingIcon from "@mui/icons-material/Downloading";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import { IconButton } from "@mui/material";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";

export default function Test() {
    const [markets, setMarkets] = useState([]);
    const [nextCursor, setNextCursor] = useState(0);
    const [finished, setFinished] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async (cursor) => {
        setLoading(true);
        const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.g.alchemy.com/v2/B8ncZIIjNn8eul-QPcOcgBac3pFdOH6_");
        const predictionWorldContract = new ethers.Contract(predictionWorldAddress, PredictionWorld.abi, provider);
        const response = await predictionWorldContract.fetchMarkets(cursor, 10, true);
        const nextMarkets = response[0];
        const nextCursor = response[1];

        setMarkets((pre) => [...pre, ...nextMarkets]);
        setNextCursor(nextCursor);
        setFinished(nextMarkets.length === 0);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData(0);
    }, [fetchData]);

    return (
        <>
            <div>Fetched Markets: {markets.length}</div>
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
