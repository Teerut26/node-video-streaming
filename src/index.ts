import axios from "axios";
import express, { Request, Response } from "express";
import fs from "fs";

const app = express();

app.get("/", (req: Request, res: Response) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/video2", (req: Request, res: Response) => {
    axios({
        method: "get",
        url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        responseType: "stream",
    }).then(function (response) {
        response.data.pipe(res);
    });
});

app.get("/video", function (req: Request, res: Response) {
    // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }

    // get video stats (about 61MB)
    const videoPath = __dirname + "/Thor-Love-and-Thunder.mp4";
    const videoSize = fs.statSync(
        __dirname + "/Thor-Love-and-Thunder.mp4"
    ).size;

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range?.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });

    // Stream the video chunk to the client
    videoStream.pipe(res);
});

app.listen(8001, () => console.log("run on port : 8001"));
