const pool = require("../database/index")

const userController = {
    getById: async (req, res) => {
        try {
            const { id } = req.params
            const result = await pool.query("select * from profile where uid = ?", [id])
            // const post = await pool.query("SELECT p.post_id,p.content FROM posts p where post_id = ?",[id])
            // const images = await pool.query("SELECT i.image_id,i.image_path FROM images i where post_id = ?",[id])
            const user = result[0]
            // res.json({
            //     user: user[0],
            //     post: post[0],
            //     images: images[0],
            // })
            res.json(user[0])
        } catch (error) {
            console.log(error)  
            res.json({
                status: "error"
            })
        }
    },
}

module.exports = userController