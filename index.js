import express from 'express';
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { authRouter } from "./routes/Auth.js";
import { userRouter } from "./routes/User.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/user", userRouter);

const VERSION = "de4e12af7f28f599-02";

const key = process.env.API_KEY;

app.get('/random-verse', async (req, res) => {
    try {
        let booksData = await axios.get(`https://api.scripture.api.bible/v1/bibles/${VERSION}/books?include-chapters=true`, {
            headers: {
                "api-key": key
            }
        });

        let randomBook = booksData.data.data[Math.floor(Math.random() * 66)];
        let randomChapterId = randomBook.chapters[Math.floor(Math.random() * (randomBook.chapters.length - 1)) + 1].id;

        let randomChapterData = await axios.get(`https://api.scripture.api.bible/v1/bibles/${VERSION}/chapters/${randomChapterId}?content-type=text&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`, {
            headers: {
                "api-key": key
            }
        });
        let randomChapter = randomChapterData.data.data;

        let randomVerseNumber = Math.ceil(Math.random() * randomChapter.verseCount);

        let randomVerseData = await axios.get(`https://api.scripture.api.bible/v1/bibles/${VERSION}/verses/${randomChapter.id}.${randomVerseNumber}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false&use-org-id=false`, {
            headers: {
                "api-key": key
            }
        });      
        let randomVerse = randomVerseData.data.data;

        const getVerseContext = (chap) => {
            let start = Math.max((randomVerseNumber-1), 1);
            let end = null;
            if (randomVerseNumber !== chap.verseCount) {
                end = (randomVerseNumber+2);
            }


            let startIndex = chap.content.indexOf(`[${start}]`);
            let endIndex = end ? chap.content.indexOf(`[${end}]`) : chap.content.length - 1;

            let section = chap.content.substr(startIndex, (endIndex - startIndex));
            let filteredSection = "";

            let inBrackets = false;
            for (let i = 0; i < section.length; i++) {
                let char = section[i];
                if (!inBrackets && char !== "[") {
                    filteredSection += char;
                } else if (char === "[") {
                    inBrackets = true;
                } else if (char === "]") {
                    inBrackets = false;
                }
            }

            return [section, filteredSection];
        }
        res.header("Access-Control-Allow-Origin", "*");
        res.status(200).json({
            "book": randomBook,
            "chapter": randomChapter,
            "verse": randomVerse,
            "num": randomVerseNumber,
            "verseContext": getVerseContext(randomChapter)[0],
            "verseContextNoNumbers": getVerseContext(randomChapter)[1],
        });
    } catch (err) {
        res.status(404).json({message: err.message});
    }
});

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(3001, () => {
        console.log(`Server port: 3001`);
    });

}).catch((err) => {
    console.log(err);
})