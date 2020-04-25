// BUDGET CONTROLLER
var budgetController = (function(){
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calculatePercentage = function(totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
        
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;  
        });
        
        data.totals[type] = sum;
    };
    
    var data = {
        
        allItems: {
            exp: [],
            inc: []
        },
        
        totals: {
            exp: 0,
            inc: 0
        },
        
        budget: 0,
        
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            if (data.allItems[type].length == 0) {
                ID = 0;
            } else {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            data.allItems[type].push(newItem);
            
            return newItem;
                
        },
        
        deleteItem: function(type, id) {
            
            data.allItems[type].forEach(function(current, index) {
                if (current.id === id) {
                    data.allItems[type].splice(index, 1);
                }
            });
        },
        
        calculateBudget: function() {
            
            // Calculate total income and budget           
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calculate the percentage of each expense
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                percentage = -1;
            }
        },
        
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calculatePercentage(data.totals.inc);
            });
        },
        
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            
            return allPercentages;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        test: function() {
            console.log(data);
        }
    };
})();


// UI CONTROLLER


var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        expenseList: '.expenses__list',
        incomeList: '.income__list',
        budgetLabel: '.budget__value',
        expenseLabel: '.budget__expenses--value',
        incomeLabel: '.budget__income--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        itemPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var format = function(value, type) {
        var valueSplit, int, dec;
        
        value = value.toFixed(2);
        valueSplit = value.split('.');
        int = valueSplit[0];
        dec = valueSplit[1];
        
        if (int.length > 3) {
            int = int.substring(0, int.length - 3) + ',' + int.substring(int.length - 3, int.length);
        }
        
        return (type === 'exp' ? '- ' : '+ ') + int + '.' + dec;
    };
    
    var eachNodeInList = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, list;
            
            if (type === 'exp') {
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
                list = DOMstrings.expenseList;
            } else {
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i><button</div></div></div>';  
                
                list = DOMstrings.incomeList;
            }
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', format(obj.value, type));
            
            document.querySelector(list).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(itemID) {
            var elem = document.getElementById(itemID);
            
            elem.parentNode.removeChild(elem);
        },
        
        clearFields: function() {
            var fields, fieldsArray;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj) {
            // Update Budget
            var type = obj.budget > 0 ? 'inc' : 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = format(Math.abs(obj.budget), type);
            document.querySelector(DOMstrings.expenseLabel).textContent = format(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.incomeLabel).textContent = format(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
        },
        
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.itemPercentageLabel);
                
            eachNodeInList(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
                
        },
        
        displayDate: function() {
            var date, year, month, months;
            
            date = new Date();
            year = date.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                     'August', 'September', 'Octocber', 'November', 'December'];
            month = date.getMonth() + 1;
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changeType: function() {
            var types = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            eachNodeInList(types, function(current) {
                current.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.addButton).classList.toggle('red');
        },
        
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMstrings();
        
        // Click to add Item
        document.querySelector(DOM.addButton).addEventListener('click', ctrlAddItem);
        
        // Hit 'enter' to add Item
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }      
        });
        
        // Click to delete Item
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        // Change the color of input fields
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };
    
    var updateBudget = function() {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function() {
    
        // 1. Calculate Percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Update Percentages
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Display Percentages in UI
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function() {
        
        var input, newItem;
        
        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the new item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();
            
            // 5. Update Budget
            updateBudget();
            
            // 6. Update Percentages
            updatePercentages();
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, id;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {    
            
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            
            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, id);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Recalculate the budget
            updateBudget();
            
            // 4. Update Percentages
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            console.log('Application has started.');
            UIController.displayBudget({
               budget: 0,
               totalExp: 0,
               totalInc: 0,
               percentage: -1
            });
            UICtrl.displayDate();
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

controller.init();