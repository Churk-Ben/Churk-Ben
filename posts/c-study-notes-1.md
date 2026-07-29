---
title: C语言学习笔记一
date: 2024-09-25
tags: ["学习笔记", "C语言"]
---

# 任务一

## 编写程序使得可以在垂直方向上打印出两个字符小人

### 源码

```c
#include <stdio.h>
int main()
{
    printf(" O \n");
    printf("<H>\n");
    printf("I I\n");
    printf("   \n");
    printf(" O \n");
    printf("<H>\n");
    printf("I I\n");
    return 0;
}
```

### 结果

![](/img/blog/2024/09/25/01/01.png)

## 编写程序使得可以在水平方向上打印出两个字符小人

### 源码

```c
#include <stdio.h>
int main()
{
    printf(" O    O \n");
    printf("<H>  <H>\n");
    printf("I I  I I\n");
    return 0;
}
```

### 结果

![](/img/blog/2024/09/25/01/02.png)
_______

# 任务二

## 从键盘上输入三角形三边，判断它能否构成三角形

### 源码

```c
#include <stdio.h>

int main(){
    float a, b, c;
    printf("输入三边长: ");
    scanf("%f %f %f", &a, &b, &c);
    if (a + b > c && a + c > b && b + c > a)
    {
        printf("三边能构成三角形。");
    } else {
        printf("三边不能构成三角形。");
    }
    return 0;
}
```

### 结果

![](/img/blog/2024/09/25/01/03.png)
____

# 任务三

### 源码

```c
#include <stdio.h>
int main()
{
    char ans1, ans2; // 用于保存用户输入的答案
    printf("每次课前认真预习、课后及时复习了没? (输入y或Y表示有，输入n或N表示没有) :");
    ans1 = getchar(); // 从键盘输入一个字符，赋值给ans1
    getchar();        // 思考这里为什么要加这一行。试着去掉这一行，看看对运行有没有影响。
    printf("\n动手敲代码实践了没? (输入y或Y表示敲了，输入n或N表示木有敲) : ");
    ans2 = getchar();
    if ((ans1 == 'y' || ans1 == 'Y') && (ans2 == 'y' || ans2 == 'Y')) // 待补足，判断用户回答ans1和ans2都是小写y或大写Y
        printf("\n罗马不是一天建成的, 继续保持哦:)\n");
    else
        printf("\n罗马不是一天毁灭的, 我们来建设吧\n");
    return 0;
}
```

### 结果

![](/img/blog/2024/09/25/01/04.png)

<small>_当然是自己运行出来的啦_</small> 🤫

### 回答 当把源代码line9去掉后，重新编译运行，结果是什么样的？
>
> 这一行的目的是为了处理换行符。在输入第一个答案后按下回车键时，换行符会被后一个`getchar()` 读取并赋值给 `ans2`，从而导致 `ans2` 不是正确的字符。

____

# 任务四

### 源码

```c
#include <stdio.h>

int main()
{
    double x, y;
    char c1, c2, c3;
    int a1, a2, a3;

    scanf_s("%d %d %d", &a1, &a2, &a3);    // 取址符 &
    printf("a1 = %d, a2 = %d, a3 = %d\n", a1, a2, a3);
    getchar();

    scanf_s("%lf,%lf", &x, &y);    // 定义为double
    printf("x = %f, y = %lf\n", x, y);
    getchar();

    scanf_s("%c", &c1);    // 多了就不行，不懂了
    printf("c1 = %c\n", c1);
    getchar();

    return 0;
}
```

### 结果

![](/img/blog/2024/09/25/01/05.png)

____

# 任务五

## 10亿秒（$10^9$s）约等于多少年？

### 源码

```c
#include <stdio.h>

int main()
{
    int year;
    long long secofayear = 365 * 24 * 60 * 60;
    long long totalsecs = 1000000000;
    year = totalsecs / secofayear + 0.5;
    printf("10亿秒约等于%d年\n", year);
    return 0;
}
```

### 结果

![](/img/blog/2024/09/25/01/06.png)

____

# 任务六

### 源码

```c
#include <stdio.h>
#include <math.h>

int main()
{
    double x, ans;
    scanf("%lf", &x);
    ans = pow(x, 365);
    printf("%.2f的365次方: %.2f\n", x, ans);
    return 0;
}
```

### 结果

![](/img/blog/2024/09/25/01/07.png)

<small>_三次`^Z`不如我一个 `^C`_</small> 🤪

____

# 任务七

## 实现摄氏度温度C与华氏度温度F的转换

### 源码

```c
#include <stdio.h>

int main()
{
    double c, f;

    while (scanf_s("%lf", &c) != EOF)
    {
        printf("请输入摄氏度: ");

        f = (c * 9.0 / 5.0) + 32;

        printf("%.2f摄氏度 = %.2f华氏度\n", c, f);
    }

    return 0;
}

```

### 结果

![](/img/blog/2024/09/25/01/08.png)

____

# 任务八

## 用海伦公式计算三角形面积

### 源码

```c
#include <stdio.h>
#include <math.h>

int main()
{
    double a, b, c, s, area;
    while (1)
    {
        printf("输入三条边长: ");
        scanf_s("%lf %lf %lf", &a, &b, &c);

        if ((a == 0) && (b == 0) && (c == 0))
        {
            break;
        }

        if ((a + b > c) && (a + c > b) && (b + c > a))
        {
            s = (a + b + c) / 2.0;

            area = sqrt(s * (s - a) * (s - b) * (s - c));

            printf("三角形面积为: %.2f\n", area);
        }
        else
        {
            printf("无法构成三角形。\n");
        }
    }

    return 0;
}
```

### 结果

![](/img/blog/2024/09/25/01/09.png)

____

# _最大的感受_

***C的I/O操作怎么这么麻烦！！！**_

<br><br><br>
$$ \_\_EOF\_\_ $$
<br>