const gcd = (a, b) => {
  if (!b) return a;
  return gcd(b, a % b);
};

const lcm = (a, b) => a * b / gcd(a, b);

const sign = a => {
  if (a > 0) return 1;
  if (a < 0) return -1;
  return 0;
}

export default function motorsStep(motor1, step1, motor2, step2, speed){
  const dir1 = sign(step1); 
  const dir2 = sign(step2);
  const absStep1 = Math.abs(step1);
  const absStep2 = Math.abs(step2);

  let total_micro_step = lcm(absStep1, absStep2);
  let micro_step1 = total_micro_step / absStep1;
  let micro_step2 = total_micro_step / absStep2;
  if (absStep1 === 0) {
    total_micro_step = absStep2;
    const micro_step2 = 1;
    const micro_step1 = absStep2 + 100;
  } else if (absStep2 === 0){
    total_micro_step = absStep1;
    const micro_step1 = 1;
    const micro_step2 = absStep1 + 100;
  }

  const T = Math.sqrt( absStep1 * absStep1 + absStep2 * absStep2 ) / speed;
  const dt = T / total_micro_step;

  for(let i = 1; i < total_micro_step; i++ ){
    let time_laps = 0;

    if ((i % micro_step1) === 0 ){
      motor1.stepp(dir1, 1, dt/4);
      time_laps += dt/4.0;
    }
    if ((i % micro_step2) === 0){
      motor2.stepp(dir2, 1, dt/4);
      time_laps += dt/4.0;
    }
    // time.sleep(dt-time_laps);
  }
}