// Budget Controller
var budgetController = (function() {

    // Entities
    var Expense = function(id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    var Income = function(id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    // our data structure to receive data.
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
        percentage: -1 // expense/income, -1 indicates if there is no value existing
    };
    
    var calculateTotal = function(type) {
        
        var sum = 0;
        data.allItems[type].forEach(function(currentValue) {
            sum += currentValue.value;
        });
        
        data.totals[type] = sum;
    };

    return {
        
        addItem: function(type, des, val) {
            var lastItemID, newItem, ID;

            // create new ID
            if (data.allItems[type].length > 0) {
                // find the last item in the array and get its id.
                lastItemID = data.allItems[type][data.allItems[type].length - 1].id;
                ID = parseInt(lastItemID) + 1;
            } else {
                ID = 0;
            }

            // create item based on their type 'inc' or 'exp'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // add item to the correct array
            // type will be 'inc' or 'exp'
            data.allItems[type].push(newItem);

            // return the new element, because of changing the UI.
            return newItem;
        },
        
        deleteItem: function(type, ID) {
            var ids, index;
            
            // mapping all elements in the arrays, and
            // storing all of its id following its element index.
            ids = data.allItems[type].map(function(current) {
               return current.id; 
            });
            
            // using the ID to get its index.
            // if ID is not found, indexof will return -1.
            index = ids.indexOf(ID)
            
            if (index !== -1) {
                // remove item from the data array
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            
            // calculate totals
            calculateTotal('inc');
            calculateTotal('exp');
            
            // calculate income - expense
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentages.
            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = -1;
            }
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        // for debug, check the data structure
        testing: function() {
            return data.allItems;
        }
    }

})();

// UI Controller
var UIController = (function() {

    // storing UI elements
    var DOMStrings = {
        inputType: '.add__type', // type input selection
        inputDesc: '.add__description', // desc input field
        inputValue: '.add__value', // value input field
        inputBtn: '.add__btn', // the add button
        incomeContainer: '.income__list', // income list class
        expenseContainer: '.expenses__list', // expense list class
        budgetLabel: '.budget__value', // display budget label class
        incomeLabel: '.budget__income--value', // display income class
        expensesLabel: '.budget__expenses--value', // display expenses class
        percentageLabel: '.budget__expenses--percentage', // display percentage class
        container: '.container'
    };

    return {
        // return input from UI
        getInput: function() {

            // returning all input values
            return {
                type : document.querySelector(DOMStrings.inputType).value,
                description : document.querySelector(DOMStrings.inputDesc).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value) // convert string to float.
            };
        },

        // getting the new added item and add it to UI list
        addListItem: function(obj, type) {
            var html, newHtml, element;

            // create html string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.desc);
            newHtml = newHtml.replace('%value%', obj.value);

            // insert html code into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        // removing element from DOM
        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        // clear the user input field to empty after user hits enter or 'save'
        clearField: function() {
            var fields, fieldsArr;

            // querySelectorAll fetches the HTML elements that we want
            // and store them into a list
            fields = document.querySelectorAll(DOMStrings.inputDesc + ',' + DOMStrings.inputValue);
            // convert the list into an Array
            fieldsArr = Array.prototype.slice.call(fields);

            // the elements of fields or fieldsArr are references which points to the same location
            // so we can set them to empty string "", to change the HTML (clear fields)
            fieldsArr.forEach(function(currentValue){
                currentValue.value = "";
            });

            // focus on the description field after saving.
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
              
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;
            if (obj.percentage !== -1) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = 'n.a';
            }
            
        },

        // return UI elements class.
        getDOMStrings: function() {
            return DOMStrings;
        }
    }
})();

// App Controller
var controller = (function(budgetCtrl, UICtrl) {

    // put all event listener inside a function.
    var setupEventListener = function() {
        // getting ui element class name.
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // adding a global listener
        document.addEventListener('keypress', function(event) {
            // check if the pressed key is the 'Enter'
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        
    };

    var updateBudget = function() {

        // calculate the budget.
        budgetCtrl.calculateBudget();

        // return the budget
        var budget = budgetCtrl.getBudget();

        // display the budget.
        UICtrl.displayBudget(budget);


    };

    var ctrlAddItem = function() {
        var input, newItem;

        // get the field input data
        input = UICtrl.getInput();
        
        // only record with desc is not empty and value positive number can be saved
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // add the new item to the UI
            UICtrl.addListItem(newItem, input.type);

            // clear the fields
            UICtrl.clearField();

            // calculate and update budget
            updateBudget();
        }
    };
    
    // handle the deletiong of item when user clicks the delete button.
    var ctrlDeleteItem = function(event) {
        var itemID, type, ID;
        
        // getting the id from the 4 levels uppers element id
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            // split the element id, get type: 'inc' or 'exp' and get the id
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // delete the item from the data
            budgetCtrl.deleteItem(type, ID);
            
            // delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // update and show the new budget
            updateBudget();
        }
    };

    return {
        init: function() {
            console.log('Application has started.');
            // init the page
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListener();
        }
    }

})(budgetController, UIController);

controller.init();