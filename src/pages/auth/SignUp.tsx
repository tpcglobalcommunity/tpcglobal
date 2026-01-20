React,  useEffect, useMemo, useRef,CheckCircle2, , XCircle";

type Language = "en" | id" | stringtyp ReferralStatus = "idle" | "checking" | "valid" | "invalid";

eLguage);

  const [refStatus, setRefStatus] = useState<ReferralStatus>("idle");
  const [refMessage, setRefMessage] = useState<string | null>(null//DeberefrralvalidiconstdbouceR=uRef<numbe | null>constlaChekedRf = ueRef<trng>""useMemo(() => ), [referralCode]eMmo(() => use, [username])  const emailTrim = useMemo(() => email.trim(), [email]);
constusernameRegex= ^[a-zA-Z0-9_.]{3,20}$;

 const localeErrr = useMemo(() => {refStats === "ivlid"n "Ivalidrefal cde.";
    if (!uname) retun usrnaeRegextes(unae
     "Uernam mus be 3-20 chaactes (letters, numbers, undersce, period).";
    if !emailTrim) return ;
    return null;
  }, [code, refStatus, uname, emailTrim, password, confirmPassword]
  const canSubmit = useMemo(() => {if(iSubmitting) rtu flse;
    if (rfStatus !=="") return flse;
    reur!locVlidatEror;
  }[isSbmittig, efStatu, loalValidateErr]);

  // Ral-timerferal valdatin (ebounced)
useEffet(() => {
    setEror(null);
    etSuccessEmail(null;
normalized = code;

    if (!normalized) {
      setRefStat("idl");
      setRefMessage(null);
      etur;
    }

    // If s as last chckdandalready validinvlid, don't recheck
    if (normalied === lastCheckedRefcurrent && (refStatus === "valid" || refStatus === "invalid")) 
      return;
    

    / DebouncedebonceRf.curent) widow.clerTieout(debounceRef.current);
    stefStatus("chckin");
    sRefMsage"Checking referral code...");

    debounceRef.crrent = widow.setTiout(async ( => {
      try  lastCheckedRef.curn = nomalized;

        cost { data: valid, error: refErr } = awaitsupaba.rpc(
          "validae_referral_code_public",
          { p_code: normalized }
        );

        if (refr) thw refEr;

        if (valid) {
          setRefStatus"valid);
          setRefMesage("Valid refrl cod");
       } else {
          setRefStat("invalid");
          seRefMessage("Invalidrferralcode");
       }
      } atc (e: ny) {
        setRefStus("invalid");
        stRefMesage(e?.message? Stringe.message) : "Faid o valida eferral code");
      }
    }, 450);
  } [code]);

  return () => {
    if(debouceRef.crrent) window.clearTieout(deounceRf.curent);
  };
  }, [code]);

  contonSbmit = asyc (e: Rat.FmEvnt) => {
   e.reventDefault();
    stErro(null);
    setSuccessEmal(null);

    // Blck submit if not reay
    if (!canSubmit {
      setError(localValidateError ?? "Please complete the form  return;
    Sfey r-checkbefr signup(serertruth)
        
       
      
TTdv className="relative">
            <i    .toUpperCase()    pr-10         div className="absolute right-3 top-12 -translate-y-1/2">
              {refStatus === "checking" && (
                <Loaer2 className="w-4 h-4 animate-spin text-whte/60" />
              )}
              {refStatus === "valid" && (
                <CheckCircle2 className="w-4 h-4 text-[#F0B90B]" />
              )}
              {refStatus === "invalid" && (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>

          {refMessage && (
            <p
              className={`mt-2 text-xs ${
                refStatus === "valid"
                  ? "text-[#F0B90B]"
                  : refStatus === "invalid"
                    ? "text-red-300"
                    : "text-white/60"
              }`}
            >
              {refMessage}
            </p>
          )}
        </di
          />        <pclassName="mt-2text-xstext-white/60">3–20chars:letters,numbers,underscore,period.<p  p className="mt-2 text-xs text-white/60">At least 8 characters.<p>
        </!cantton>

        <div className="text-center text-sm text-whie/60">
          Invie-ly. Referral required. <span className="mx-1">•</span> Your data is protected.
        </div