# Chip-seq 学习笔记

## 1.Chip-seq实验

+ 概念
    + Chip-seq(Chromatin Immunoprecipitation,CHIP)研究体内蛋白质和DNA相互作用的工具，用于转录因子结合位点或组蛋白特异性修饰位点的研究 
    + OCRs:染色质可及区域，大多数dna多次缠绕形成染色体，但一些dna仅和组蛋白形成核小体，部分dna不与组蛋白结合形成开放区域。DNA复制和转录通常发生在开放区域，并且TF与开放区域结合可以达到调控下游基因。
    + 顺式作用元件：在同一条核苷酸链上起调控基因作用的核酸序列，顺式作用元件本身不编码任何蛋白质，仅仅提供一个作用位点，要与反式作用因子相互作用而起作用。类型：Promoter，enhancer，silencer，insulator
    + 反式作用因子(TF)：指和顺式作用元件结合的可扩散性蛋白，包括基础因子，上游因子，诱导因子。
        + > 转录因子（Transcription factor，TF）是能够结合在某基因上游5’端特异序列上的蛋白质，它作为反式作用因子，与真核基因的顺式作用元件比如启动子、增强子等发生特异性相互作用，从而激活或者抑制基因的转录。
        + ![TF](image-5.png)
    + > 顺式作用元件件在分子遗传学领域，相对同一染色体或DNA分子而言为“顺式”（cis）；对不同染色体或DNA分子而言为“反式”（trans）
+ Chip-seq意义
    + 本质是染色质免疫共沉淀+二代测序
    + 两大类应用——TF ChIP 和Histone ChIP
        + TF Chip-seq:用来确定靶蛋白也就是转录因子是否结合特定基因组区域（如启动子或其它DNA结合位点）。
        + Histone Chip-seq:确定组蛋白修饰相关的特定位点，还可以确定组蛋白修饰酶类的靶标
            + 为什么组蛋白容易被修饰?
                > 组蛋白N端有一段富含赖氨酸和精氨酸的“尾巴”，尾巴上的氨基酸可以被修饰酶催化添加各种修饰基团，如磷酸化、甲基化、乙酰化和泛素化等等，这个过程就称为组蛋白修饰。在表观遗传中，组蛋白修饰对基因表达的调控非常非常重要，最常见的组蛋白修饰就是甲基化和乙酰化
            + 组蛋白的修饰有什么影响？
                > 组蛋白乙酰化与染色质的开放和转录激活相关
                > 组蛋白甲基化修饰有不同的修饰类型和氨基酸，既可以激活转录（如H3K4me3、H3K36me3、H3K79me3等），也可以抑制转录（如H3K9me3、H3K27me3等）。
+ Chip-seq实验流程
    ![实验流程](image-4.png)
    1. DNA与蛋白质交联
    2. 染色体片段化处理
    3. 免疫沉淀
    4. DNA解交联及纯化
    5. 测序数据分析

## 2.数据分析使用工具(使用bioconda下载 conda install -r bioconda)
+ sra-tools:操作SRA（reads and reference alignments）数据的工具集，用于从SRA文件中提取fastq文件
+ bowtie2：将短序列比对导模板基因组的工具，擅长将50-100bp的比对
+ samtools：用于SAM格式后处理对齐的程序。
    > SAM格式是序列比对之后的输出格式
    > BAM文件是SAM文件的二进制
+ picard:在BAM或SAM文件中查找并标记重复读取？？
+ macs2：用于call peaks来确定dna和蛋白质互作的位点
+ deeptool：可视化格式转化工具
+ ROSE（上官网wget下载压缩包）：通过bam文件以及gff文件寻找enhancer及其相关基因的工具

## 3.Chip-seq pipline流程

+ ![Chip-seq数据处理流程](image-3.png)
1. 下载Chip-seq原始数据
2. 下载人类参考基因组并建立index
3. 使用bowtie2比对：fastq文件中相邻read之间没有位置关系。在建库和测序之后，read完全被打乱。将read和参考基因组比较，并把每一条read在参考基因组上定位，按fastq的顺序排好
4. PCR去重复
5. Peak calling：查找DNA结合位点，使用MACS获得Chip-seq富集区
6. 使用IGV工具进行可视化
7. 使用ROSE筛选super-enhancer

> __Single-end和Paired-end区别__[[参考文章](https://zhuanlan.zhihu.com/p/61963366#:~:text=%E6%B5%8B%E5%BA%8F%E6%9C%80%E7%AE%80%E5%8D%95%E7%9A%84%E5%8A%9E%E6%B3%95%E6%98%AF%E5%8D%95%E7%AB%AF%E6%B5%8B%E5%BA%8F%EF%BC%8C%E5%8D%95%E7%AB%AF%E6%B5%8B%E5%BA%8F%E9%A1%BE%E5%90%8D%E6%80%9D%E4%B9%89%EF%BC%8C%E5%8F%AA%E6%9C%89%E4%B8%80%E7%A7%8D%E6%B5%8B%E5%BA%8F%E5%BC%95%E7%89%A9%20%EF%BC%8C%E4%BD%BF%E5%BE%97PCR%E5%8F%AA%E8%83%BD%E6%B2%BF%E7%9D%80%E8%BF%99%E4%B8%AA%E5%BC%95%E7%89%A9%E7%9A%84%E6%96%B9%E5%90%91%E8%BF%9B%E8%A1%8C%EF%BC%8C%E6%89%80%E6%9C%89%E7%9A%84%20reads%20%E9%83%BD%E5%8F%AA%E8%83%BD%E6%8C%89%E7%85%A7%E4%B8%80%E4%B8%AA%E6%96%B9%E5%90%91%E8%BF%9B%E8%A1%8C%E8%AF%BB%E5%8F%96%E3%80%82%20%E4%BD%86%E6%98%AF%E8%BF%99%E5%B8%A6%E6%9D%A5%E4%BA%86%E4%B8%80%E4%BA%9B%E9%97%AE%E9%A2%98%EF%BC%8C%E4%BB%A5%20illumina%20%E4%B8%BA%E4%BE%8B%EF%BC%8C%E6%B5%8B%E5%BA%8F%E7%9A%84%E8%B4%A8%E9%87%8F%E4%BC%9A%E9%9A%8F%E7%9D%80%E6%B5%8B%E5%BA%8F%E7%9A%84%E8%BF%9B%E8%A1%8C%E8%80%8C%E4%B8%8B%E9%99%8D%EF%BC%8C%E6%89%80%E4%BB%A5%20reads,%E7%BA%A6%E5%BE%80%E5%90%8E%E9%9D%A2%E8%B6%8A%E4%B8%8D%E5%87%86%E7%A1%AE%EF%BC%9B%E7%A0%94%E7%A9%B6%E8%80%85%E4%BB%AC%E6%83%B3%E5%87%BA%E6%9D%A5%E7%9A%84%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95%E5%B0%B1%E6%98%AF%E5%8F%8C%E7%AB%AF%E6%B5%8B%E5%BA%8F%EF%BC%8C%E5%AF%B9%E4%B8%80%E4%B8%AA%E9%95%BF%E4%B8%BA%20500%20bp%20%E7%9A%84%E5%BA%8F%E5%88%97%EF%BC%8C%E5%8D%95%E7%AB%AF%E6%B5%8B%E5%BA%8F%E4%B8%8B%E6%B8%B8%E8%B4%A8%E9%87%8F%E4%BC%9A%E5%BE%88%E5%B7%AE%EF%BC%8C%E4%BD%86%E6%98%AF%E4%BB%8E%E4%B8%A4%E4%B8%AA%E6%96%B9%E5%90%91%E4%B8%8A%E5%88%86%E5%88%AB%E6%B5%8B%20250%20bp-300%20bp%20%E7%84%B6%E5%90%8E%E5%86%8D%E6%8B%BC%E6%8E%A5%E8%B5%B7%E6%9D%A5%EF%BC%8C%E5%B0%B1%E5%8F%AF%E4%BB%A5%E5%A4%A7%E5%A4%A7%E6%8F%90%E9%AB%98%E6%B5%8B%E5%BA%8F%E7%9A%84%E5%87%86%E7%A1%AE%E7%8E%87%E4%BA%86%E3%80%82)]  
![区分](image-6.png)
> + Single-end:首先将DNA样本进行片段化处理形成200-500bp的片段，引物序列连接到DNA片段的一端，然后末端加上接头，将片段固定在flow cell上生成DNA簇，上机测序单端读取序列
>   + 特点：只有一种测序引物 ，使得PCR只能沿着这个引物的方向进行，所有的 reads 都只能按照一个方向进行读取
>   + 问题：测序的质量会随着测序的进行而下降，所以 reads 约往后面越不准确
> + Pair-end:指在构建待测DNA文库时在两端的接头上都加上测序引物结合位点，在第一轮测序完成后，去除第一轮测序的模板链，用对读测序模块(Paired-End Module)引导互补链在原位置再生和扩增，以达到第二轮测序所用的模板量，进行第二轮互补链的合成测序
>   + 特点：从DNA片段的两端进行读取，分别读取超过一半再通过重合部分进行拼接
>   + 测序方向示意图：![测序](image-7.png)
>   + 拼接示意图：![拼接](image-8.png)