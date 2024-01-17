#!/bin/bash

#This code was uploaded 8.Nov.23

#SBATCH -J MYTESTJOB
#SBATCH -p 2023Fall
#SBATCH -o OUTPUT_%A_%a.log
#SBATCH -e OUTPUT_%A_%a.err

hostname

source /opt/sw/anaconda3/etc/profile.d/conda.sh
conda activate

python compute_pi.py
