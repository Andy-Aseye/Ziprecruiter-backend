import express, {Request, Response} from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.get("/resume/:file", (req: Request, res: Response) => {
try{
    const address = path.join(__dirname, `../public/resume/${req.params.file}`);
    fs.accessSync(address, fs.constants.F_OK);
    res.sendFile(address);
} catch (err) {
    res.status(404).json({
        message: "File not found",
    });
}

});


router.get("/profile/:file", (req: Request, res: Response) => {
    try {
        const address = path.join(__dirname, `../public/profile/${req.params.file}`)
        fs.accessSync(address, fs.constants.F_OK);
        res.sendFile(address);
    } catch (err) {
        res.status(404).json({
            message: "File not found",
        });
    }
});


export default router;