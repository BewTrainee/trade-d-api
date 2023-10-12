const pool = require("../database/index")

const chatController = {
    getChat : async (req,res) => {
        try {
            const { uid } = req.params
            const result = await pool.query("CALL GetChat(?);",[uid])
            data = result[0]
            res.json(data[0])
        } catch (error) {
            console.log(error)
            res.json({
                status: "error"
            })
        }
    },
    get_message: async (req,res) => {
        try {
            const { chat_id } = req.params
            const result = await pool.query
            ("CALL GetMessages(?);",[chat_id])
            data = result[0]
            res.json(data[0])
        } catch (error) {
            console.log(error)
            res.json({
                status:"error"
            })
        }
    }
}
module.exports = chatController