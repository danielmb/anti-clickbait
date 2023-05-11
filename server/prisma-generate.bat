robocopy ..\prisma ..\server\prisma /E
call npm run prisma:generate
rmdir /S /Q ..\server\prisma
