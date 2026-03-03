const ExcelJS = require("exceljs")

async function generateMonthlyExcel(logs) {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet("Compras")

    sheet.columns = [
        { header: "Usuario", key: "user", width: 30 },
        { header: "Producto", key: "product", width: 30 },
        { header: "Precio", key: "price", width: 15 },
        { header: "Fecha", key: "date", width: 20 }
    ]

    logs.forEach(log => {
        // Verificar si id_user existe y tiene datos
        const userName = log.id_user ? 
            (log.id_user.name || log.id_user.username || "N/A") : 
            "Usuario eliminado";

        log.products.forEach(product => {
            sheet.addRow({
                user: userName,
                product: product.name,
                price: product.price,
                date: log.createdAt.toISOString().split("T")[0]
            })
        })
    })

    return workbook
}

module.exports = { generateMonthlyExcel }
