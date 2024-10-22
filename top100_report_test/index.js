let data = {
    'action': '補人數回報頁面',
    'line_group_uid': "Cb6e9b0a8f27092ead640866197c6f39d",
    'line_uid': "U7d97232f259c299dca82a5fd761debc3",
    'line_displayName': "林子敬",
    'line_pictureUrl': "https://sprofile.line-scdn.net/0hEH68mpBrGmcbQQ7SmbNkGGsRGQ04MEN1NXVdByoTR152IV0yPnBXBC1BQ1MkIlVlPyFTBCcRQlMXUm0BBRfmUxxxRFAid1g5Nydchw"
};
console.log(data);
let form = document.createElement('form');
form.method = 'post';
form.action = "https://script.google.com/macros/s/AKfycbx9Aha_85wswzTlYZ1xETh9OSaUnYrtIFKjhcaqekhtlAdMIaYdLbugabZbT3FcV65k/exec"
document.body.appendChild(form);

for (const key in data) {
    const formField = document.createElement('input');
    formField.type = 'hidden';
    formField.name = key;
    formField.value = data[key];

    form.appendChild(formField);
}
form.submit();