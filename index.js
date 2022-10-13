const PORT = 4000
const express = require("express");
const cors = require("cors");
const app = express();
const pool = require('./db/conn');
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

// Post 
app.post("/employee", async (req, res) => {
    try {
        const { name, date_of_joining, designation, gender, email, bio } = req.body;
        const employeeData = await pool.query("INSERT INTO EMPLOYEE(name, date_of_joining, designation, gender, email, bio) VALUES($1,$2,$3,$4,$5,$6) returning *",
            [name, date_of_joining, designation, gender, email, bio])
        res.json(employeeData.rows[0]);
    } catch (error) {
        res.status(500).json(error);
    }
})

app.post("/team", async (req, res) => {
    try {
        const { name, email, description } = req.body;
        const teamData = await pool.query("INSERT INTO TEAM(name, email, description) VALUES($1,$2,$3) returning *",
            [name, email, description])
        res.json(teamData.rows[0]);
    } catch (error) {
        res.status(500).json(error);
    }
})

app.post("/employeeAssignment", async (req, res) => {
    try {
        const { employee_id, team_id } = req.body;
        const teamData = await pool.query("INSERT INTO employee_assignment(employee_id, team_id) VALUES($1,$2) returning *",
            [employee_id, team_id])
        res.json(teamData.rows[0]);
    } catch (error) {
        res.status(500).json(error);
    }
})
// Get All
app.get('/employees', async (req, res) => {
    try {
        const employeeData = await pool.query("SELECT * FROM employee");
        res.json(employeeData.rows);
    } catch (error) {
        res.status(500).json(error);
    }
})
// Get 
app.get('/employee/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let data = {};
        const employeeData = await pool.query("SELECT * FROM employee WHERE id=$1", [id]);
        data = employeeData;
        res.json(data);
    } catch (error) {
        res.status(500).json(error);
    }
})
// Get Nested Data
app.get('/employeeData/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let data = {};
        const employeeData = await pool.query("SELECT * FROM employee WHERE id=$1", [id]);
        const teams = await pool.query("SELECT * FROM team WHERE ID IN (SELECT team_id from employee_assignment where employee_id=$1)", [id]);
        data = employeeData.rows[0];
        if (data) {
            data.teams=teams.rows
        }else{
            data={
                info:"NO employee Data for this id"
            }
        }

        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
})
// update 
app.put('/employee/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, date_of_joining, designation, gender, email, bio } = req.body;
        let data = {};
        const employeeData = await pool.query("UPDATE employee set name=$1, date_of_joining=$2,designation=$3 ,gender=$4 ,email=$5 ,bio=$6 WHERE id=$7 returning *",
         [name, date_of_joining, designation, gender, email, bio ,id]);
        data = employeeData.rows[0];
        res.json(data);
    } catch (error) {
        res.status(500).json(error);
    }
})
// delete 
app.delete('/employee/:id', async (req, res) => {
    try {
      const {id}=req.params;
      let data={}
      const employeeAssignmentData=await pool.query("DELETE from employee_assignment WHERE employee_id=$1 returning *",
      [id]);
      const employeeData=await pool.query("DELETE from employee WHERE id=$1 returning *",
      [id]);
      data=employeeData.rows[0];
      if(data){
        data.teams=employeeAssignmentData.rows
      }else{
        data={
            info:"NO employee to deklete"
        }
      }
      res.json(data)
    } catch (error) {
        res.status(500).json(error);
    }
})

app.listen(PORT, () => {
    console.log(`Server is started in PORT no ${PORT}`)
});