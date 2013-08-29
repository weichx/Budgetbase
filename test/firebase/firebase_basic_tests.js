module('Budgetbase basics', {
    setup:function(){
        new Firebase(R).root().remove();
    }
});