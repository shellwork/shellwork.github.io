---
title: Mass Spectrometer Study
date: 2024-02-07 12:39:13
tags: 
    - Omics
    - Bioinformatics
---

## 蛋白质质谱流程

> #### Reference
> https://zhuanlan.zhihu.com/p/549773172
> https://zhuanlan.zhihu.com/p/434306528

### 概念

![Alt text](image-8.png)

+ 研究目的：解析基因组全部的蛋白质组，并通过蛋白定量和定性上变化反映细胞、器官和有机体的生理变化
+ 研究手段：蛋白质的鉴定可以通过特定肽段序列来鉴别（前提）质谱（MS）其扫描速度、灵敏度和分析复杂混合物的能力是一种非常适合分析蛋白质的技术
+ 基本原理和步骤
    ![Alt text](image-3.png)
    + 蛋白质酶解：一般使用内切酶将样品蛋白质切割为小短肽
    + 液相色谱（HPLC）分离：将切割后的短肽按照质量顺序分离
    + 质谱分析
        + 电离源：使得肽段带有正电荷或负电荷
            + 基质辅助激光电离源（MALDI）
                样品首先与大量过量的基质化合物（CHCA、DBA等）形成共结晶，之后通过激光照射形成基质电子。
            + 电喷雾电离源（ESI）
            ![Alt text](image-4.png)
                + 液滴形成：样品溶液（A）通过雾化器进入喷雾室，同时雾化气体（如N2）通过围绕喷雾针的同轴套管进入喷雾室。由于雾化气体强的剪切力及喷雾室上筛网电极与端板上的强电压（2-4Kv），将样品溶液拉出，并将其碎裂成小液滴
                + 去溶剂化：随着小液滴的分散，在静电引力的作用下，一种极性离子移到液滴表面，样本被载运并分散成带电荷的更微小液滴。在干燥器-氮气的逆流作用下，液滴的直径随之变小，液滴表面电荷密度增加
                + 气相离子：当达到极限时，液滴由于带电分子之间的斥力发生库伦爆炸（Columbic repulsion）。随着液滴的不断爆炸，裸离子从液滴表面发射出来，转变为气体离子进入后续检测
            > 优势：高分子量的分子可带多个电荷
        + 质量分析器的评估指标
            a.准确度（accuracy）：指离子测量的准确性。一般用真实值和测量值之间的误差进行评价，单位ppm（part per million）
            b.分辨率（Resolution）：是指质谱仪区分两个质量相近的离子的能力。分辨率越高，准确度越高
            c.灵敏度（sensitivity）：是指检测器对一定样品量的信号响应值，即最少样品量的检出程度。
        + 质量分析器：筛选特定荷质比的离子
            ![Alt text](image.png)
            + 四极杆（Quadrupole, Q）
                +由四根圆柱形金属棒组成，两根接正极，两根接负极。通过切换直流和交流电压控制离子在四极杆内运动，一边飞行，一边转圈。当扫描电压和频率一定的时候，只有特定m/z的离子才会显示出稳定的轨迹，进而传输到检测器中获得离子的m/z值，其他离子就会因偏转太多而打到四极杆上。
            + 飞行时间（Time of flight, TOF）
            + 线性离子阱（ion trap）
            + 轨道阱（Orbitrap）
            ![Alt text](image-2.png)
            > 质量过滤器可过滤特定质荷比的离子，可让特定的离子穿过四极杆，可用于目标离子的筛选；质量检测器用于检测不同质荷比的离子
        + 离子检测
    > 串联质谱
        ![Alt text](image-1.png)
        > 一般来说现有的质谱仪在以上几种积木中排列组合，构成一个完整的workflow
        > 每经过一个质量分析器就是一个MS过程，如LC-MS/MS就是指经液相色谱分离后的物质，在两个串联质量分析器的作用下完成母离子检测和子离子检测过程
        > 母离子(MS1)和子离子(MS2)来源于二次碎裂，两个串联质量分析器之间还存在碰撞室，会将母离子与不反应的气体（如氮气）快速碰撞,发生二次碎裂得到其子离子

### 鉴定方法

#### 标记定量蛋白组

+ 同位素亲和标签（isotope-coded affinity tag, ICAT）
    + 原理：ICAT试剂带有特定质量的同位素可专与蛋白质或肽段的L2半胱氨酸的巯基反应
    + 结构：
        ![Alt text](image-5.png)
        + 一头链接一个巯基的特异反应基团，可以与蛋白质中的半胱氨酸的巯基相连
        + 另一头连接生物素。用于标记蛋白质或多肽链的亲和纯化
    + 实验方法
        ![Alt text](image-6.png)
    + 优点：它可以对混合样本（来自正常和病变的细胞或组织）直接检验并能快速定性和定量鉴定低丰度蛋白
+ 酶催化 18O 同位素标记法
    ![Alt text](image-7.png)
    + 酶解蛋白能够产生同位素标记的肽段：肽键断裂并将带有18O的水结合在肽段上。
+ 同种同位素标签标记法（Isobaric tags for relative and absolute quantification，ITRAQ ）
    + 概念：是通过对氨基酸N端和赖氨酸残基进行酶解后进行同位素标记的技术
    + 结构
        + 反应基团：特异与肽段的氨基(肽段的 N 端、赖氨酸的氨基)发生结合反应
        + 报告基团：质量数不同
        + 平衡基团：保持iTRAQ试剂总质量数稳定，同时保证肽段在色谱中的保留时间相同
    + 原理
        + 等质量，使得不同标记的肽段在一级质谱中表现同一个母离子峰
        + 进一步碎裂，平衡基团发生中性丢失，报告集团产生不同质量的报告离子，可以比较该样本的相对丰度比
        > 报告离子峰:其强度反应了该肽段在不同样品中的相对表达量信息
    + 实验流程
        ![Alt text](image-9.png)（图片出处为：Aggarwal S., Yadav A.K. (2016) Dissecting the iTRAQ Data Analysis. In: Jung K. (eds) Statistical Analysis in Proteomics. Methods in Molecular Biology, vol 1362. Humana Press, New York, NY，P278）
    + 优势：同时对4个或8个样本标记定量
+ 串联质谱标签(Tandem Mass Tag, TMT)
    + 概念： 一种多肽体外标记技术,原理实验方法基本与iTRAQ一致
    + 优势：可做最多16标的样本标记定量

#### 非标记定量蛋白组（Lable Free Quatification, LFQ）

+ 离子流色谱峰(extracted ion current, XIC)

+ 基于谱图计数法(spectral counting,SC)

## MaxQuant使用

### MaxQuant workflow

> Whole process:
    Data acquisition - Rawdata -> Max Quant - MQ output tables -> Statistics & systems biology
> MaxQuant process:
    Feature detection -> Initial Andromeda search -> Recalibration -> Main Andromeda search -> Consolidation/ protein quatification
>  

+ 区分LFQ & iBAQ
    + Intensity：将Protein Group中的所有Unique和Razor peptides的信号强度求和，作为最原始的强度值
    + iBAQ：基于 Intensity 的强度值，除以该蛋白的理论肽段数目，主要用于同一样本内，不同蛋白的相互比较
    + LFQ：基于 Intensity 的强度值，在不同样本间执行矫正操作，达到降低样本预处理，仪器分析等操作造成的样本间的差异，主要用于同一蛋白，不同样本间的表达差异。比如，不同处理方法间，同一蛋白的表达量变化

+ 区分BPC & TIC & XIC
    + BPC（基峰图）是将每个时间点质谱图中最强的离子的强度连续描绘得到的图谱
    + TIC（总离子流图）是将每个时间点质谱图中所有离子的强度加和后连续描绘得到的图谱
    + XIC（提取离子流图）是将每个时间点质谱图中目标离子的强度连续描绘得到的图谱。
