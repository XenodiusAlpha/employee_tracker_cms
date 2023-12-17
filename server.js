const { prompt } = require("inquirer");
const db = require("./db/connection");

intit()

function intit(){
    LoadMainPrompts();
}

function quit() {
    process.exit(0);
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