#!/usr/bin/env python
import os
import numpy as np

def getenv(var, default=""):
    return os.environ.get(var, str(default))

job_id = int(getenv("SLURM_JOB_ID", 0))
task_id = int(getenv("SLURM_ARRAY_TASK_ID", 0))
np.random.seed(job_id * 1000 + task_id)

n = 100000
rx = np.random.uniform(-1, 1, n)
ry = np.random.uniform(-1, 1, n)
n_in = np.sum(rx * rx + ry * ry < 1)

print(n_in, n, n_in / n * 4)
