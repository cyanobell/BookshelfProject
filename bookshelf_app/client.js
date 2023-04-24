function render(todos){
    $(".todos").children().not(".template").remove();
    const template = $(".todos").children(".template");

    todos.forEach((todo) => {
        const node = template.clone(true).show().removeClass("template")

        node.find(".text").text(todo.task);
        node.find(".id").text(todo.id);
        $(".todos").append(node);
    });
}
function getTodos(){
    fetch('/api/todos')
        .then((data) => data.json())
        .then((json) => {
            const todos = json;
            render(todos);
        });
}

function createTodo(){
    const text = $(".new-todo-text").val();
    fetch('/api/todos', {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({text: text}),
        })
        .then(() => {
            getTodos();
        });
}

function deleteTodo(el){
    const id = $(el).closest(".todo").find(".id").text();
    fetch(`/api/todos/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            getTodos();
        });
}

$(getTodos);

