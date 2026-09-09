#!/bin/bash

#SBATCH -J MYTESTJOB
#SBATCH -p sichpc
#SBATCH -c 2
#SBATCH --mem=4G
#SBATCH -t 00:10:00
#SBATCH -o logs/OUTPUT_%A_%a.log
#SBATCH -e logs/OUTPUT_%A_%a.err

hostname

source /opt/shared/miniconda3/etc/profile.d/conda.sh
conda activate myenv

python compute_pi.py
