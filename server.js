const { prompt } = require("inquirer");
const db = require("./db/connection");

intit()

function intit(){
    LoadMainPrompts();
}

function quit() {
    process.exit(0);
}

async function next(){
    const input = await prompt([{
        type:'confirm',
        name:'confirmation',
        message:'Return back to main menu?',
    }]
    ).then(( res)=>{
        if(res.confirmation){
            //run the loadingPrompt
            LoadMainPrompts();
        }
        else{
            process.exit(0)
        }
    })
}

function LoadMainPrompts() {
    prompt([
        {
            type: "list",
            name: "choice",
            message: "What would you like to do?",
            choices:[
                {
                    name:"View all departments",
                    value:"VIEW_ALL_DEPARTMENTS"
                },
                {
                    name:"View all roles",
                    value:"VIEW_ALL_ROLES"
                },
                {
                    name:"View all employees",
                    value:"VIEW_ALL_EMPLOYEES"
                },
                {
                    name:"Add Department",
                    value:"ADD_DEPARTMENT"
                },
                {
                    name:"Add role",
                    value:"ADD_ROLE"
                },
                {
                    name:"Add employee",
                    value:"ADD_EMPLOYEE"
                },
                {
                    name:"Update employee role",
                    value:"UPDATE_EMPLOYEE_ROLE"
                },
                //add an exit
                {
                    name:"Quit",
                    value:"QUIT"
                }
            ]
        }]).then((res)=>{
                let choice = res.choice;
                
                switch(choice){
                    case "VIEW_ALL_DEPARTMENTS":
                        viewAllDepartments();
                        break;
                    case "VIEW_ALL_ROLES":
                        viewAllRoles();
                        break;
                    case "VIEW_ALL_EMPLOYEES":
                        viewAllEmployees();
                        break;
                    case "ADD_DEPARTMENT":
                        addDepartment();
                        break;
                    case "ADD_ROLE":
                        addRole();
                        break;   
                    case "ADD_EMPLOYEE":
                        addEmployee();
                        break;
                    case "UPDATE_EMPLOYEE_ROLE":
                        updateEmployeeRole();
                        break;
                    case "QUIT":
                        quit();
                        break;
                    default:
                        quit();
                }
        })
}

// function viewAllDepartments() {

// }

// function viewAllRoles() {

// }

function viewAllEmployees() {
    const viewSQL = `SELECT employee.id, 
                            employee.first_name, 
                            employee.last_name, 
                            role.title as title,
                            department.name as department,
                            role.salary as salary,
                            CONCAT(manager.first_name, ' ', manager.last_name) as manager
                            FROM employee
                            LEFT JOIN role ON employee.role_id = role.id
                            LEFT JOIN department ON role.department_id = department.id
                            LEFT JOIN employee manager ON manager.id = employee.manager_id;
                    `;
    db.query(viewSQL, (err,res)=>{
        if(err){
            console.log('we hit an error')
        }else{
            console.table(res);
            next();
        }
    })
}

function addDepartment() {
    prompt([{
        type:'input',
        name:'departmentName',
        message:'What is the name of the department?',
        validate: (departmentNameInput) => {
            if (departmentNameInput) {
                return true;
            } else {
                return false;
            }
        },
    }]).then(res=>{
        let departmentName = res.departmentName;
        const newDepartment = {
            name:departmentName
        }
        const insertSQL = `INSERT INTO department SET ?`;
        db.query(insertSQL, newDepartment,(err,res)=>{
            if(err){
                console.log('we hit an error')
            }else{
                console.log('added')
                next();
            }
        })
    })
}


function addRole() {
    prompt([{
        type:'input',
        name:'roleName',
        message:'What is the name of the role?',
        validate: (roleNameInput) => {
            if (roleNameInput) {
                return true;
            } else {
                console.log("Please enter a role name");
                return false;
            }
        },
    },{
        type:'input',
        name:'roleSalary',
        message:'What is the salary of the role?',
        validate: (roleSalaryInput) => {
            if (roleSalaryInput) {
                return true;
            } else {
                console.log("Please enter a role name");
                return false;
            }
        },
    }]).then(res=>{
        let roleName = res.roleName;
        let roleSalary = res.roleSalary;
        const sql = `SELECT *
        FROM department`;
            db.query(sql, res, (error,result)=>{
                const departmentChoice = result.map(department =>({
                    name:`${department.name}`,
                    value: department.id
                }))
                prompt ([{
                    type:'list',
                    name:'Department_Id',
                    message:'Pick a department',
                    choices:departmentChoice
                }]).then( departmentResult => {
                    const newRoleWithDepartments = {
                        title:roleName,
                        salary:roleSalary,
                        department_id:departmentResult.Department_Id
                    }

                    const insertSQL = "INSERT INTO role SET ?";

                    db.query(insertSQL, newRoleWithDepartments,(err,res)=>{
                        if(err){
                            console.log('we hit an error')
                        }else{
                            console.log('added')
                            next();
                        }
                    })
                })
            })
    })
}

function addEmployee() {
    prompt([{
        type:'input',
        name:'firstName',
        message:"What is the employee's first name?"
    },{
        type:'input',
        name:'lastName',
        message:"What is the employee's last name"
    }]).then(res=>{
        let firstName = res.firstName;
        let lastName = res.lastName;

        const sql = `SELECT role.id, role.title, 
        department.name AS department, 
        role.salary 
        FROM role 
        LEFT JOIN department ON role.department_id = department.id`;

            db.query(sql, res,(error,result)=>{
                const roleChoice = result.map(role =>({
                    name:`${role.title} (${role.department}, Salary:${role.salary})`,
                    value: role.id
                }))
                prompt([{
                    type:'list',
                    name:'Role_Id',
                    message:'Pick a role',
                    choices:roleChoice
                }]).then( roleResult =>{
                    const newEmployeeWithRoles = {
                        first_name:firstName,
                        last_name:lastName,
                        role_id:roleResult.Role_Id
                    }

                    const insertSQL = "INSERT INTO employee SET ?";

                    db.query(insertSQL, newEmployeeWithRoles,(err,res)=>{
                        if(err){
                            console.log('we hit an error')
                        }else{
                            console.log('added')
                            next();
                        }
                    })
                })
            })
    })
}

// function updateEmployeeRole() {

// }