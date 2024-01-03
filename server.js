// allows use of inquirer package
const { prompt } = require("inquirer");
// allows use of cfonts package
const cFonts = require('cfonts');
// parameters for database connection brought in externally
const db = require("./db/connection");
// call on init function
init();

// function to start initialization of cli application
function init() {
    loadLogo();
    loadMainPrompts();
}

// function to exit cli application
function quit() {
    process.exit(0);
}

// function to query user if they want to continue using cli application or exit after running one of the cases in the switch
async function next(){
    const input = await prompt([{
        type:'confirm',
        name:'confirmation',
        message:'Return back to main menu?',
    }]
    ).then(( res)=>{
        if(res.confirmation){
            // return back to main menu
            loadMainPrompts();
        }
        else{
            // exit application
            quit();
        }
    })
}


function loadLogo() {
    cFonts.say('Employee Tracker', {
        font: 'block',
        align:'left',
        colors:'white'
    });
};

// function to load the main prompts that allow the user to view and add departments/roles/employees, as well as update an employee role and exit application.
function loadMainPrompts() {
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
                {
                    name:"Quit",
                    value:"QUIT"
                }
            ]
        }]).then((res)=>{
                let choice = res.choice;
                // depending on choice made, will call on corresponding function.
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

// function to allow the user to view all departments
function viewAllDepartments() {
    const viewSQL = `SELECT department.id,
                            department.name
                            FROM department;
                    `;
    db.query(viewSQL, (err,res)=>{
        if(err){
        console.error('Error querying departments', err);
        }else{
        console.table(res);
        next();
        }
    })
}

// function to allow the user to view all roles
function viewAllRoles() {
    const viewSQL = `SELECT role.id,
                            role.title,
                            department.name AS department,
                            role.salary
                            FROM role
                            LEFT JOIN department ON role.department_id = department.id;
                    `;
    db.query(viewSQL, (err,res)=>{
        if(err){
            console.error('Error querying roles', err);
        }else{
            console.table(res);
            next();
        }
    })
}

// function to allow the user to view all employees
function viewAllEmployees() {
    const viewSQL = `SELECT employee.id, 
                            employee.first_name, 
                            employee.last_name, 
                            role.title AS title,
                            department.name AS department,
                            role.salary AS salary,
                            CONCAT(manager.first_name, ' ', manager.last_name) as manager
                            FROM employee
                            LEFT JOIN role ON employee.role_id = role.id
                            LEFT JOIN department ON role.department_id = department.id
                            LEFT JOIN employee manager ON manager.id = employee.manager_id;
                    `;
    db.query(viewSQL, (err,res)=>{
        if(err){
            console.error('Error querying employees', err)
        }else{
            console.table(res);
            next();
        }
    })
}

// function to allow the user to add a department
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
        };
        const insertSQL = `INSERT INTO department SET ?;`;
        db.query(insertSQL, newDepartment,(err,res)=>{
            if(err){
                console.error('Error adding department', err);
            }else{
                console.log('New department has been added');
                next();
            }
        })
    })
}

// function to allow the user to add a role
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
                console.log("Please enter a role salary");
                return false;
            }
        },
    }]).then(res=>{
        let roleName = res.roleName;
        let roleSalary = res.roleSalary;
        const sql = `SELECT *
                    FROM department;`;
            db.query(sql, res, (error,result)=>{
                if (error) {
                    console.error('Error querying department', error);
                } else {
                    const departmentChoice = result.map(department =>({
                        name:`${department.name}`,
                        value: department.id
                    }));
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
                        };
    
                        const insertSQL = "INSERT INTO role SET ?;";
    
                        db.query(insertSQL, newRoleWithDepartments,(err,res)=>{
                            if(err){
                                console.error('Error adding role', err);
                            }else{
                                console.log('New role has been added');
                                next();
                            }
                        });
                    });
                }
                
            });
    });
}

// function to allow the user to add an employee
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

        const sql = `SELECT role.id, 
                            role.title, 
                            department.name AS department, 
                            role.salary 
                            FROM role 
                            LEFT JOIN department ON role.department_id = department.id;
                    `;

            db.query(sql, res,(error,result)=>{
                const roleChoice = result.map(role =>({
                    name:`${role.title} (${role.department}, Salary:${role.salary})`,
                    value: role.id
                }));
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
                    };

                    const insertSQL = "INSERT INTO employee SET ?";

                    db.query(insertSQL, newEmployeeWithRoles,(err,res)=>{
                        if(err){
                            console.error('Error adding employee', err);
                        }else{
                            console.log('New employee has been added');
                            next();
                        }
                    })
                })
            })
    })
}

// function to allow the user to update the role of an existing employee
function updateEmployeeRole() {
    const sql = `SELECT employee.id,
                        CONCAT(employee.first_name, ' ', employee.last_name) AS full_name
                FROM employee;
                `;
        db.query(sql, (err, res)=>{
            if(err){
                console.error('Error querying employees', err);
            }else{
                const employeeChoice = res.map(employee =>({
                    name: `${employee.full_name}`,
                    value: employee.id
                }));
                prompt([{
                    type:'list',
                    name:'Employee_Id',
                    message:`Which employee's role do you want to update?`,
                    choices:employeeChoice
                }]).then( employeeResult =>{
                    const selectedEmployeeId = employeeResult.Employee_Id;

                    const roleSQL = `SELECT id,
                                            title
                                            FROM role
                                    `;

                    db.query(roleSQL,(err,res)=>{
                        if(err){
                            console.error('Error querying roles', err);
                        }else{
                            const roleChoice = res.map(role => ({
                                name: role.title,
                                value: role.id
                            }));

                            prompt([{
                                type:'list',
                                name:'Role_Id',
                                message:'Which role do you want to assign the selected employee?',
                                choices:roleChoice
                            }]).then(roleResult => {
                                const selectedRoleId = roleResult.Role_Id;

                                const updateSQL = `UPDATE employee
                                                    SET role_id = ?
                                                    WHERE id = ?;
                                                `;
                                    db.query(updateSQL, [selectedRoleId, selectedEmployeeId], (err, res) => {
                                        if (err) {
                                            console.error('Error updating employee role', err);
                                        } else {
                                            console.log('Employee role updated successfully');
                                            next();
                                        }
                                    });
                            });
                        }
                    });
                    
                });
            }
        });
}