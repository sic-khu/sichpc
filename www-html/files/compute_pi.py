#!/usr/bin/env python

#This code was uploaded 8.Nov.23

import numpy as np
import pandas as pd
import sys, os

def getenv(var, default=''):
    if var not in os.environ: return str(default)
    return os.environ[var]

jobId = int(getenv('SLURM_JOB_ID', 0))
jobSection = int(getenv('SLURM_ARRAY_TASK_ID', 0))
np.random.seed(jobId*1000+jobSection)

n = 100000
rx = np.random.uniform(-1, 1, n)
ry = np.random.uniform(-1, 1, n)
r2 = rx*rx + ry*ry
nIn = (r2<1).sum()

print(nIn, n, nIn/n*4)
