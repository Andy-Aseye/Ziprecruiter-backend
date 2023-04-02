import express, {Request, Response} from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.get("/resume/:file", (req: Request, res: Response) => {
try{
    const address = path.join(__dirname, `../public/documents/${req.params.file}`);
    console.log(address)
    fs.accessSync(address, fs.constants.F_OK);
    res.sendFile(address);
} catch (err) {
    res.status(404).json({
        message: "File not found",
    });
}

});


router.get("/cover-letter/:file", (req: Request, res: Response) => {
    try {
        const address = path.join(__dirname, `../public/documents/${req.params.file}`)
        fs.accessSync(address, fs.constants.F_OK);
        res.sendFile(address);
    } catch (err) {
        res.status(404).json({
            message: "File not found",
        });
    }
});


export default router;